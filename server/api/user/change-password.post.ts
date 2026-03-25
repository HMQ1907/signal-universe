import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { current_password, new_password } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: fullUser } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', user.id)
    .single()

  if (!fullUser) throw createError({ statusCode: 404, message: 'User not found' })

  const isValid = await bcrypt.compare(current_password, fullUser.password_hash)
  if (!isValid) {
    throw createError({ statusCode: 400, message: 'Current password is incorrect' })
  }

  const newHash = await bcrypt.hash(new_password, 10)
  await supabase.from('users').update({ password_hash: newHash }).eq('id', user.id)

  return { success: true, message: 'Password changed successfully' }
})
