import { z } from 'zod'

const schema = z.object({
  email: z.string().email()
})

export default defineEventHandler(async (event) => {
  await requireMainAdmin(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid email' })

  const email = parsed.data.email.toLowerCase().trim()
  const supabase = getSupabaseAdmin()

  const { data: target } = await supabase
    .from('users')
    .select('id, email, is_admin, is_sub_admin')
    .eq('email', email)
    .single()

  if (!target) throw createError({ statusCode: 404, message: 'User not found' })
  if (target.is_admin) throw createError({ statusCode: 400, message: 'User is already a main admin' })
  if (target.is_sub_admin) throw createError({ statusCode: 400, message: 'User is already a sub-admin' })

  await supabase.from('users').update({ is_sub_admin: true }).eq('id', target.id)

  return { success: true, id: target.id, email: target.email }
})
