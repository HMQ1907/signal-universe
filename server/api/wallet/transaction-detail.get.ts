import { requireAuth, getSupabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const txId = query.id as string

  if (!txId) {
    throw createError({
      statusCode: 400,
      message: 'Transaction ID is required'
    })
  }

  const supabase = getSupabaseAdmin()

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  await supabase
    .from('transactions')
    .update({ status: 'cancelled' })
    .eq('status', 'pending_confirmation')
    .eq('user_id', user.id)
    .lt('created_at', fiveMinAgo)

  const { data: tx, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .eq('user_id', user.id)
    .single()

  if (error || !tx) {
    throw createError({
      statusCode: 404,
      message: 'Transaction not found'
    })
  }

  return { transaction: tx }
})
