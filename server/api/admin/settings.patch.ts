import { z } from 'zod'

const schema = z.object({
  updates: z.array(z.object({ key: z.string(), value: z.string() }))
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  for (const update of parsed.data.updates) {
    await supabase.from('site_settings').update({
      value: update.value,
      updated_by: admin.id,
      updated_at: new Date().toISOString()
    }).eq('key', update.key)
  }

  await logAdminAction(admin.id, 'update_settings', { note: `Updated ${parsed.data.updates.length} settings` })

  return { success: true }
})
