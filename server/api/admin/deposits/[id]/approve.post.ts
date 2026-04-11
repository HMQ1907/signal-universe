import { createNotification, logAdminAction } from '~~/server/utils/supabase'

/** User was already credited on submit; admin only confirms TX and marks completed. */
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = Number(getRouterParam(event, 'id'))
  const supabase = getSupabaseAdmin()

  const { data: tx } = await supabase
    .from('transactions')
    .select('*, user:users!transactions_user_id_fkey(*)')
    .eq('id', txId)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .single()

  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })

  const user = tx.user as any

  await supabase
    .from('transactions')
    .update({ status: 'completed', processed_by: admin.id, processed_at: new Date().toISOString() })
    .eq('id', txId)

  await logAdminAction(admin.id, 'approve_deposit', {
    targetUserId: user.id,
    targetTransactionId: txId,
    amountChange: tx.amount
  })

  await createNotification(
    user.id,
    'Deposit verified',
    `Your deposit of $${tx.amount} has been verified.`
  )

  return { success: true }
})
