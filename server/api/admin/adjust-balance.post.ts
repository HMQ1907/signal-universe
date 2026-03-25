import { requireAdmin, getSupabaseAdmin, logAdminAction, createNotification } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event) || {}
  const { userId, amount, note } = body

  if (!userId || amount === undefined || amount === 0) {
    throw createError({
      statusCode: 400,
      message: 'User ID and amount are required'
    })
  }

  const supabase = getSupabaseAdmin()

  // Get current user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, phone, full_name, balance')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  const newBalance = user.balance + amount

  if (newBalance < 0) {
    throw createError({
      statusCode: 400,
      message: 'Balance cannot be negative'
    })
  }

  // Update balance
  const { error: updateError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', userId)

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: 'Failed to update balance'
    })
  }

  // Create transaction record (DB constraint: amount > 0, so store absolute value)
  // Use admin_note prefix [CREDIT] or [DEDUCT] to indicate direction
  const direction = amount > 0 ? '[CREDIT]' : '[DEDUCT]'
  const fullNote = note ? `${direction} ${note}` : direction
  
  const { error: txError } = await supabase.from('transactions').insert({
    user_id: userId,
    type: 'admin_adjust',
    amount: Math.abs(amount),
    status: 'completed',
    admin_note: fullNote,
    processed_by: admin.id,
    processed_at: new Date().toISOString()
  })

  if (txError) {
    console.error('Failed to create transaction record:', txError)
  }

  // Log admin action
  await logAdminAction(admin.id, 'adjust_balance', {
    targetUserId: userId,
    oldValue: user.balance.toString(),
    newValue: newBalance.toString(),
    amountChange: amount,
    note,
    ipAddress: getHeader(event, 'x-forwarded-for') || undefined,
    userAgent: getHeader(event, 'user-agent') || undefined
  })

  // Notify user - bilingual
  const formattedAmount = new Intl.NumberFormat('en-US').format(Math.abs(amount))
  const titleObj = amount > 0
    ? { en: 'Balance increased', vi: 'Số dư tăng' }
    : { en: 'Balance decreased', vi: 'Số dư giảm' }
  const messageObj = amount > 0
    ? { en: `Your account has been credited +$${formattedAmount}${note ? `. Reason: ${note}` : ''}`, vi: `Tài khoản của bạn đã được cộng +$${formattedAmount}${note ? `. Lý do: ${note}` : ''}` }
    : { en: `Your account has been debited -$${formattedAmount}${note ? `. Reason: ${note}` : ''}`, vi: `Tài khoản của bạn đã bị trừ -$${formattedAmount}${note ? `. Lý do: ${note}` : ''}` }
  
  await createNotification(
    userId,
    titleObj,
    messageObj,
    amount > 0 ? 'success' : 'warning'
  )

  return {
    message: 'Balance adjusted successfully',
    oldBalance: user.balance,
    newBalance,
    change: amount
  }
})
