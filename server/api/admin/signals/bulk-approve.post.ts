import { z } from 'zod'

const schema = z.object({
  session_id: z.number(),
  profit_percent: z.number().min(0).max(2)
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid input' })

  const { session_id, profit_percent } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: confirmations } = await supabase
    .from('signal_confirmations')
    .select('id')
    .eq('session_id', session_id)
    .eq('status', 'pending')

  if (!confirmations?.length) {
    return { success: true, processed: 0 }
  }

  let processed = 0
  for (const confirmation of confirmations) {
    try {
      await $fetch(`/api/admin/signals/${confirmation.id}/approve`, {
        method: 'POST',
        body: { profit_percent }
      })
      processed++
    } catch {}
  }

  await supabase.from('signal_sessions').update({ status: 'processed', closed_at: new Date().toISOString() }).eq('id', session_id)

  return { success: true, processed }
})
