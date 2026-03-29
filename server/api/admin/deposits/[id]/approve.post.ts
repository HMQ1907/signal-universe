import { applyApprovedDepositCredits } from '~~/server/utils/depositApproval'
import { createNotification, logAdminAction } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = Number(getRouterParam(event, 'id'))
  const supabase = getSupabaseAdmin()

  const { data: tx } = await supabase
    .from('transactions')
    .select('*, user:users(*)')
    .eq('id', txId)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .single()

  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })

  const user = tx.user as any

  await applyApprovedDepositCredits(supabase, user, tx.amount)

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
    'Deposit Approved',
    `Your deposit of $${tx.amount} has been approved. Your DeFi tier follows your total balance.`
  )

  return { success: true }
})
