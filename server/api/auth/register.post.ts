import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  referral_code: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0].message })
  }

  const { email, password, full_name, referral_code } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    throw createError({ statusCode: 400, message: 'Email already registered' })
  }

  let referrerId: number | null = null
  if (referral_code) {
    const { data: referrer } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', referral_code.toUpperCase())
      .single()

    if (!referrer) {
      throw createError({ statusCode: 400, message: 'Invalid referral code' })
    }
    referrerId = referrer.id
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name,
      referred_by: referrerId,
      email_verified: true
    })
    .select()
    .single()

  if (error || !user) {
    throw createError({ statusCode: 500, message: 'Registration failed' })
  }

  return { success: true, message: 'Registration successful. Please login.' }
})
