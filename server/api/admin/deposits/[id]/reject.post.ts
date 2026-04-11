import { z } from 'zod'
import { revertDepositCredits } from '~~/server/utils/depositApproval'

const schema = z.object({ reason: z.string().optional() })

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  const supabase = getSupabaseAdmin()
  const { data: tx } = await supabase
    .from('transactions')
    .select('*, user:users!transactions_user_id_fkey(id, email)')
    .eq('id', txId)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .single()

  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })

  await revertDepositCredits(supabase, {
    id: tx.id,
    amount: Number(tx.amount),
    user_id: tx.user_id,
    is_first_deposit: tx.is_first_deposit,
    created_at: tx.created_at
  })

  const reason = parsed.data?.reason?.trim()
  const mergedNote = [tx.admin_note, reason ? `Rejected: ${reason}` : ''].filter(Boolean).join(' | ')

  await supabase.from('transactions').update({
    status: 'rejected',
    processed_by: admin.id,
    processed_at: new Date().toISOString(),
    admin_note: mergedNote || null
  }).eq('id', txId)

  await logAdminAction(admin.id, 'reject_deposit', { targetUserId: (tx.user as any).id, targetTransactionId: txId })
  await createNotification((tx.user as any).id, 'Deposit Rejected', `Your deposit was rejected and credited amounts were reversed. ${parsed.data?.reason || ''}`)

  return { success: true }
})
