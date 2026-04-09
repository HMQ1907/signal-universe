export default defineEventHandler(async (event) => {
  const admin = await requireMainAdmin(event)
  const txId = Number(getRouterParam(event, 'id'))
  if (!txId) throw createError({ statusCode: 400, message: 'Invalid transaction id' })

  const supabase = getSupabaseAdmin()

  const { data: tx } = await supabase
    .from('transactions')
    .select('id, user_id, type, amount, status')
    .eq('id', txId)
    .single()

  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })

  await supabase.from('transactions').delete().eq('id', txId)

  await logAdminAction(admin.id, 'delete_transaction', {
    targetUserId: tx.user_id,
    targetTransactionId: txId,
    note: `Deleted ${tx.type} $${tx.amount} (${tx.status})`
  })

  return { success: true }
})
