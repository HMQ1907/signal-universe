import { z } from 'zod'

const schema = z.object({ reason: z.string().optional() })

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  const supabase = getSupabaseAdmin()
  const { data: tx } = await supabase
    .from('transactions')
    .select('*, user:users!transactions_user_id_fkey(id)')
    .eq('id', txId)
    .in('type', ['withdraw_profit', 'withdraw_capital'])
    .eq('status', 'pending')
    .single()

  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })

  await supabase.from('transactions').update({
    status: 'rejected', processed_by: admin.id,
    processed_at: new Date().toISOString(),
    admin_note: parsed.data?.reason
  }).eq('id', txId)

  await logAdminAction(admin.id, 'reject_withdrawal', { targetUserId: (tx.user as any).id, targetTransactionId: txId })
  await createNotification((tx.user as any).id, 'Withdrawal Rejected', `Your withdrawal has been rejected. ${parsed.data?.reason || ''}`)

  return { success: true }
})
