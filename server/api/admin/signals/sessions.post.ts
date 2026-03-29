import { z } from 'zod'

const schema = z.object({
  session_date: z.string(),
  time_window: z.literal('daily').optional().default('daily')
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('signal_sessions')
    .insert({ session_date: parsed.data.session_date, time_window: parsed.data.time_window, status: 'open' })
    .select()
    .single()

  if (error) throw createError({ statusCode: 400, message: 'Session already exists for this time' })

  await logAdminAction(admin.id, 'create_signal_session', { note: `${parsed.data.session_date} ${parsed.data.time_window}` })

  return { success: true, session: data }
})
