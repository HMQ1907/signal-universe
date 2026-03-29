import { z } from 'zod'
import { generateOtpCode } from '~~/server/utils/helpers'
import { sendPasswordResetEmail } from '~~/server/utils/email'

const schema = z.object({ email: z.string().email() })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid email' })
  }

  const { email } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email.toLowerCase())
    .single()

  if (!user) {
    return { success: true, message: 'If this email exists, you will receive a reset code.' }
  }

  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await supabase.from('otp_codes').insert({
    email: email.toLowerCase(),
    code,
    type: 'reset_password',
    expires_at: expiresAt
  })

  await sendPasswordResetEmail(email, code)

  return { success: true, message: 'Reset code sent to your email.' }
})
