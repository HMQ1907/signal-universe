import { z } from 'zod'

const schema = z.object({
  full_name: z.string().min(1).optional()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const supabase = getSupabaseAdmin()
  await supabase.from('users').update(parsed.data).eq('id', user.id)

  return { success: true }
})
