import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateToken } from '~~/server/utils/helpers'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { email, password } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  if (!user.is_active) {
    throw createError({ statusCode: 403, message: 'Account disabled' })
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    throw createError({ statusCode: 401, message: 'Invalid email or password' })
  }

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('sessions').insert({
    user_id: user.id,
    token,
    ip_address: getClientIp(event),
    user_agent: getRequestHeader(event, 'user-agent'),
    expires_at: expiresAt
  })

  await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/'
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_admin: user.is_admin,
      balance: user.balance,
      locked_capital: user.locked_capital,
      investment_package: user.investment_package,
      referral_code: user.referral_code
    }
  }
})
