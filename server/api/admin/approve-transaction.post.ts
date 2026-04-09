import { z } from 'zod'
import { applyApprovedDepositCredits } from '~~/server/utils/depositApproval'

const schema = z.object({
  transactionId: z.number(),
  action: z.enum(['approve', 'reject']),
  note: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdminOrSubAdmin(event)
  const body = await readBody(event) || {}
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Transaction ID and action are required' })
  }

  const { transactionId, action, note } = parsed.data
  const supabase = getSupabaseAdmin()

  // Get transaction with user info
  const { data: txRaw, error: txError } = await supabase
    .from('transactions')
    .select('*, user:users!transactions_user_id_fkey (id, email, full_name, balance, locked_capital, referred_by, investment_package, first_deposit_at)')
    .eq('id', transactionId)
    .single()

  const tx = txRaw as any

  if (txError || !tx) {
    throw createError({ statusCode: 404, message: 'Transaction not found' })
  }

  if (tx.status !== 'pending') {
    throw createError({ statusCode: 400, message: 'Transaction has already been processed' })
  }

  // Sub-admins can only process withdrawals, not deposits
  if (!admin.is_admin && tx.type === 'deposit') {
    throw createError({ statusCode: 403, message: 'Sub-admin cannot process deposits' })
  }

  const newStatus = action === 'approve' ? 'completed' : 'rejected'
  const user = tx.user as any

  // Update transaction status
  await supabase
    .from('transactions')
    .update({
      status: newStatus,
      processed_by: admin.id,
      processed_at: new Date().toISOString(),
      admin_note: note || null
    })
    .eq('id', transactionId)

  // Handle balance changes based on type and action
  if (action === 'approve') {
    if (tx.type === 'deposit') {
      await applyApprovedDepositCredits(supabase, user, tx.amount)
    }
    // For approved withdrawals: balance was NOT deducted at request time,
    // so we need to deduct it now
    if (tx.type === 'withdraw_profit') {
      await supabase
        .from('users')
        .update({ balance: Math.max(0, user.balance - tx.amount) })
        .eq('id', user.id)
    }
    if (tx.type === 'withdraw_capital') {
      await supabase
        .from('users')
        .update({ locked_capital: Math.max(0, user.locked_capital - tx.amount) })
        .eq('id', user.id)
    }
  }

  // For rejected withdrawals: nothing to refund since we didn't deduct at request time

  // Send notifications and log admin action
  await logAdminAction(admin.id, `${action}_transaction`, {
    targetUserId: user.id,
    targetTransactionId: transactionId,
    oldValue: 'pending',
    newValue: newStatus,
    amountChange: tx.amount,
    note,
    ip: getClientIp(event)
  })

  const typeLabel = tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'
  const statusLabel = action === 'approve' ? 'approved' : 'rejected'
  await createNotification(
    user.id,
    `${typeLabel} ${statusLabel}`,
    action === 'approve'
      ? `Your ${typeLabel.toLowerCase()} of $${tx.amount.toFixed(2)} has been ${statusLabel}.${note ? ` Note: ${note}` : ''}`
      : `Your ${typeLabel.toLowerCase()} of $${tx.amount.toFixed(2)} has been ${statusLabel}.${note ? ` Reason: ${note}` : ''}`
  )

  return { message: `Transaction has been ${statusLabel}`, status: newStatus }
})
