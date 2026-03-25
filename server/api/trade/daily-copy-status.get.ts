import { getSupabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const client = getSupabaseAdmin()
  const query = getQuery(event)

  const userId = query.userId as string
  const timeWindow = query.timeWindow as string

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'Missing userId'
    })
  }

  // Vietnam time (UTC+7) derived from UTC parts (no double-offset bugs)
  const utcNow = new Date()
  const vnHour = (utcNow.getUTCHours() + 7) % 24
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split('T')[0]

  let normalizedWindow = timeWindow
  if (!normalizedWindow) {
    if (vnHour >= 10 && vnHour < 15) {
      normalizedWindow = '10:00'
    } else if (vnHour >= 15 && vnHour < 20) {
      normalizedWindow = '15:00'
    } else {
      normalizedWindow = '10:00'
    }
  } else {
    normalizedWindow = timeWindow.includes('10:') ? '10:00'
      : timeWindow.includes('15:') ? '15:00'
      : timeWindow
  }

  const { data: rows } = await client
    .from('daily_copy_trade_requests')
    .select('id, status, time_window, created_at')
    .eq('user_id', userId)
    .eq('request_date', today)
    .eq('time_window', normalizedWindow)
    .limit(1)

  const data = rows?.[0] || null

  return {
    hasSubmittedToday: !!data,
    status: data?.status || null,
    timeWindow: data?.time_window || null,
    submittedAt: data?.created_at || null
  }
})
