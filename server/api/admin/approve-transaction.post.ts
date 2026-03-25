import { requireAdmin, getSupabaseAdmin, logAdminAction, createNotification } from '~~/server/utils/supabase'
import { sendTransactionEmail } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event) || {}
  const { transactionId, action, note } = body

  if (!transactionId || !['approve', 'reject'].includes(action)) {
    throw createError({
      statusCode: 400,
      message: 'Transaction ID and action are required'
    })
  }

  const supabase = getSupabaseAdmin()

  // Get transaction
  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('*, user:user_id (id, email, phone, full_name, balance, referred_by)')
    .eq('id', Number(transactionId))
    .single()

  if (txError || !tx) {
    throw createError({
      statusCode: 404,
      message: 'Transaction not found'
    })
  }

  if (tx.status !== 'pending') {
    throw createError({
      statusCode: 400,
      message: 'Transaction has already been processed'
    })
  }

  const newStatus = action === 'approve' ? 'completed' : 'rejected'

  // Update transaction
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      status: newStatus,
      processed_by: Number(admin.id),
      processed_at: new Date().toISOString(),
      admin_note: note || null
    })
    .eq('id', Number(transactionId))

  if (updateError) {
    console.error('Transaction update error:', updateError)
    throw createError({
      statusCode: 500,
      message: `Failed to update transaction: ${updateError.message}`
    })
  }

  // Handle balance changes
  if (tx.type === 'deposit' && action === 'approve') {
    // Add balance for approved deposit
    await supabase
      .from('users')
      .update({ balance: (tx.user as any).balance + tx.amount })
      .eq('id', tx.user_id)

    // Referral bonus: 5% of deposit amount to the referrer
    const referrerId = (tx.user as any).referred_by
    if (referrerId) {
      const bonusAmount = Number((tx.amount * 0.05).toFixed(2))
      if (bonusAmount > 0) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id, balance')
          .eq('id', referrerId)
          .single()

        if (referrer) {
          // Parallelize referrer updates
          await Promise.all([
            supabase
              .from('users')
              .update({ balance: referrer.balance + bonusAmount })
              .eq('id', referrer.id),
            supabase.from('transactions').insert({
              user_id: referrer.id,
              type: 'referral_bonus',
              amount: bonusAmount,
              status: 'completed',
              admin_note: `5% referral bonus from ${(tx.user as any).email || (tx.user as any).phone} deposit $${tx.amount}`
            }),
            createNotification(
              referrer.id,
              { en: 'Referral bonus', vi: 'Thưởng giới thiệu' },
              { en: `You received $${bonusAmount.toLocaleString()} (5%) from your referral's deposit of $${tx.amount.toLocaleString()}.`, vi: `Bạn nhận được $${bonusAmount.toLocaleString()} (5%) từ giao dịch nạp tiền $${tx.amount.toLocaleString()} của người bạn giới thiệu.` },
              'success'
            )
          ])
        }
      }
    }
  } else if (tx.type === 'withdraw' && action === 'reject') {
    // Refund balance for rejected withdrawal
    await supabase
      .from('users')
      .update({ balance: (tx.user as any).balance + tx.amount })
      .eq('id', tx.user_id)
  }

  // Parallelize: admin log + user notification + email (all independent)
  const formattedAmount = new Intl.NumberFormat('en-US').format(tx.amount)
  const typeTextEn = tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'
  const typeTextVi = tx.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'
  
  let titleObj: { en: string; vi: string }
  let messageObj: { en: string; vi: string }
  if (action === 'approve') {
    titleObj = { en: `${typeTextEn} successful`, vi: `${typeTextVi} thành công` }
    messageObj = tx.type === 'deposit'
      ? { en: `Your deposit of $${formattedAmount} has been approved. Balance has been credited.${note ? ` Note: ${note}` : ''}`, vi: `Yêu cầu nạp $${formattedAmount} của bạn đã được duyệt. Số dư đã được cộng vào tài khoản.${note ? ` Ghi chú: ${note}` : ''}` }
      : { en: `Your withdrawal of $${formattedAmount} has been approved. Please check your wallet.${note ? ` Note: ${note}` : ''}`, vi: `Yêu cầu rút $${formattedAmount} của bạn đã được duyệt. Vui lòng kiểm tra ví của bạn.${note ? ` Ghi chú: ${note}` : ''}` }
  } else {
    titleObj = { en: `${typeTextEn} rejected`, vi: `${typeTextVi} bị từ chối` }
    messageObj = tx.type === 'deposit'
      ? { en: `Your deposit of $${formattedAmount} has been rejected.${note ? ` Reason: ${note}` : ''}`, vi: `Yêu cầu nạp $${formattedAmount} của bạn đã bị từ chối.${note ? ` Lý do: ${note}` : ''}` }
      : { en: `Your withdrawal of $${formattedAmount} has been rejected. The amount has been refunded.${note ? ` Reason: ${note}` : ''}`, vi: `Yêu cầu rút $${formattedAmount} của bạn đã bị từ chối. Số tiền đã được hoàn lại vào tài khoản.${note ? ` Lý do: ${note}` : ''}` }
  }

  const sideEffects: Promise<any>[] = [
    logAdminAction(admin.id, `${action}_transaction`, {
      targetUserId: tx.user_id,
      targetTransactionId: transactionId,
      oldValue: 'pending',
      newValue: newStatus,
      amountChange: tx.amount,
      note,
      ipAddress: getHeader(event, 'x-forwarded-for') || undefined,
      userAgent: getHeader(event, 'user-agent') || undefined
    }),
    createNotification(
      tx.user_id,
      titleObj,
      messageObj,
      action === 'approve' ? 'success' : 'error'
    )
  ]

  if ((tx.user as any).email) {
    sideEffects.push(
      sendTransactionEmail(
        (tx.user as any).email,
        tx.type as 'deposit' | 'withdraw',
        tx.amount,
        newStatus as 'completed' | 'rejected'
      )
    )
  }

  await Promise.all(sideEffects)

  return {
    message: `Transaction has been ${action === 'approve' ? 'approved' : 'rejected'}`,
    status: newStatus
  }
})
