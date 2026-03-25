export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = Number(getRouterParam(event, 'id'))
  const supabase = getSupabaseAdmin()

  const { data: tx } = await supabase
    .from('transactions')
    .select('*, user:users(*)')
    .eq('id', txId)
    .in('type', ['withdraw_profit', 'withdraw_capital'])
    .eq('status', 'pending')
    .single()

  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })
  const user = tx.user as any

  if (tx.type === 'withdraw_profit') {
    if (user.balance < tx.amount) throw createError({ statusCode: 400, message: 'Insufficient user balance' })
    await supabase.from('users').update({ balance: user.balance - tx.amount }).eq('id', user.id)
  } else {
    if (user.locked_capital < tx.amount) throw createError({ statusCode: 400, message: 'Insufficient capital' })
    await supabase.from('users').update({
      locked_capital: user.locked_capital - tx.amount,
      investment_package: null,
      first_deposit_at: null
    }).eq('id', user.id)
  }

  await supabase.from('transactions').update({
    status: 'completed', processed_by: admin.id, processed_at: new Date().toISOString()
  }).eq('id', txId)

  await logAdminAction(admin.id, 'approve_withdrawal', { targetUserId: user.id, targetTransactionId: txId, amountChange: -tx.amount })
  await createNotification(user.id, 'Withdrawal Approved', `Your withdrawal of $${tx.amount} has been approved.`)

  return { success: true }
})
