import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

let adminClient: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!adminClient) {
    const config = useRuntimeConfig()
    adminClient = createClient(
      config.public.supabaseUrl as string,
      config.supabaseServiceKey as string,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )
  }
  return adminClient
}

export async function getUserFromSession(event: H3Event) {
  const token =
    getCookie(event, 'auth_token') ||
    getRequestHeader(event, 'authorization')?.replace('Bearer ', '')

  if (!token) return null

  const supabase = getSupabaseAdmin()
  const { data: session } = await supabase
    .from('sessions')
    .select('*, user:users(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session || !session.user) return null

  await supabase
    .from('sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('token', token)

  return session.user as User
}

export async function requireAuth(event: H3Event) {
  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  if (!user.is_active) {
    throw createError({ statusCode: 403, message: 'Account disabled' })
  }
  return user
}

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  if (!user.is_admin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return user
}

export async function logAdminAction(
  adminId: number,
  action: string,
  opts: {
    targetUserId?: number
    targetTransactionId?: number
    oldValue?: string
    newValue?: string
    amountChange?: number
    note?: string
    ip?: string
  } = {}
) {
  const supabase = getSupabaseAdmin()
  await supabase.from('admin_logs').insert({
    admin_id: adminId,
    action,
    target_user_id: opts.targetUserId,
    target_transaction_id: opts.targetTransactionId,
    old_value: opts.oldValue,
    new_value: opts.newValue,
    amount_change: opts.amountChange,
    note: opts.note,
    ip_address: opts.ip
  })
}

export async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: string = 'info'
) {
  const supabase = getSupabaseAdmin()
  await supabase.from('notifications').insert({ user_id: userId, title, message, type })
}

export interface User {
  id: number
  email: string
  full_name: string | null
  balance: number
  locked_capital: number
  investment_package: number | null
  first_deposit_at: string | null
  cccd_url: string | null
  referral_code: string
  referred_by: number | null
  is_admin: boolean
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}
