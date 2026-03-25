import { getSupabaseAdmin } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const client = getSupabaseAdmin()
  const body = await readBody(event) || {}
  
  const { adminId, date } = body
  
  if (!adminId) {
    throw createError({
      statusCode: 400,
      message: 'Missing adminId'
    })
  }
  
  const targetDate = date || new Date().toISOString().split('T')[0]
  
  // Get all pending requests for the date
  const { data: pendingRequests, error: fetchError } = await client
    .from('daily_copy_trade_requests')
    .select('*, users!daily_copy_trade_requests_user_id_fkey(id, balance)')
    .eq('status', 'pending')
    .eq('request_date', targetDate)
  
  if (fetchError) {
    console.error('Error fetching pending requests:', fetchError)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch pending requests'
    })
  }
  
  if (!pendingRequests || pendingRequests.length === 0) {
    return {
      success: true,
      message: 'Không có yêu cầu nào cần duyệt',
      approvedCount: 0
    }
  }
  
  let approvedCount = 0
  let totalAmount = 0
  const errors: string[] = []
  const now = new Date().toISOString()

  // Process requests in parallel batches of 10 for better throughput
  const BATCH_SIZE = 10
  for (let i = 0; i < pendingRequests.length; i += BATCH_SIZE) {
    const batch = pendingRequests.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(async (request) => {
        const currentBalance = request.users?.balance || 0
        const bonusAmount = Number((currentBalance * 0.01).toFixed(2))
        const newBalance = currentBalance + bonusAmount

        // Run all 3 operations in parallel for each request
        const [balanceResult, txResult, statusResult] = await Promise.all([
          client
            .from('users')
            .update({ balance: newBalance })
            .eq('id', request.user_id),
          client
            .from('transactions')
            .insert({
              user_id: request.user_id,
              type: 'copy_trade',
              amount: bonusAmount,
              status: 'completed',
              admin_note: `Daily Copy Trade bonus - ${request.time_window}`,
              processed_by: adminId,
              processed_at: now
            }),
          client
            .from('daily_copy_trade_requests')
            .update({
              status: 'approved',
              processed_by: adminId,
              processed_at: now,
              admin_note: 'Bulk approved',
              amount: bonusAmount
            })
            .eq('id', request.id)
        ])

        if (balanceResult.error) throw balanceResult.error
        if (txResult.error) throw txResult.error
        if (statusResult.error) throw statusResult.error

        return bonusAmount
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        approvedCount++
        totalAmount += result.value
      } else {
        errors.push(result.reason?.message || 'Unknown error')
      }
    }
  }
  
  return {
    success: true,
    message: `Đã duyệt ${approvedCount}/${pendingRequests.length} yêu cầu`,
    approvedCount,
    totalAmount,
    errors: errors.length > 0 ? errors : undefined
  }
})
