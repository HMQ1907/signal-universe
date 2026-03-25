import { requireAuth, getSupabaseAdmin, createNotification } from '~~/server/utils/supabase'

const CONFIRMATION_WINDOW_MS = 5 * 60 * 1000

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event) || {}
  const { transactionId } = body

  if (!transactionId) {
    throw createError({
      statusCode: 400,
      message: 'Transaction ID is required'
    })
  }

  const supabase = getSupabaseAdmin()

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', user.id)
    .eq('type', 'deposit')
    .single()

  if (txError || !tx) {
    throw createError({
      statusCode: 404,
      message: 'Transaction not found'
    })
  }

  if (tx.status !== 'pending_confirmation') {
    throw createError({
      statusCode: 400,
      message: 'Transaction is not awaiting confirmation'
    })
  }

  const createdAt = new Date(tx.created_at).getTime()
  const now = Date.now()

  if (now - createdAt > CONFIRMATION_WINDOW_MS) {
    await supabase
      .from('transactions')
      .update({ status: 'cancelled' })
      .eq('id', transactionId)

    throw createError({
      statusCode: 400,
      message: 'Confirmation window has expired (5 minutes)'
    })
  }

  const { error: updateError } = await supabase
    .from('transactions')
    .update({ status: 'pending' })
    .eq('id', transactionId)

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: 'Failed to confirm deposit'
    })
  }

  await createNotification(
    user.id,
    { en: 'Deposit confirmed', vi: 'Đã xác nhận nạp tiền' },
    { en: `Your deposit of $${tx.amount} has been confirmed and is now pending admin approval.`, vi: `Yêu cầu nạp $${tx.amount} của bạn đã được xác nhận và đang chờ admin duyệt.` },
    'info'
  )

  return {
    success: true,
    message: 'Deposit confirmed successfully'
  }
})
