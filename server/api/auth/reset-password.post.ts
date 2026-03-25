import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  new_password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { email, code, new_password } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: otp } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('type', 'reset_password')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!otp) {
    throw createError({ statusCode: 400, message: 'Invalid or expired code' })
  }

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const passwordHash = await bcrypt.hash(new_password, 10)

  await supabase.from('users').update({ password_hash: passwordHash }).eq('id', user.id)
  await supabase.from('otp_codes').update({ used: true, used_at: new Date().toISOString() }).eq('id', otp.id)
  await supabase.from('sessions').delete().eq('user_id', user.id)

  return { success: true, message: 'Password reset successfully.' }
})
