export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const supabase = getSupabaseAdmin()

  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, balance, locked_capital, investment_package, first_deposit_at, cccd_url, referral_code, is_admin, is_sub_admin, is_active, created_at, last_login_at')
    .eq('id', user.id)
    .single()

  const { count: f1Count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', user.id)

  return { ...data, f1_count: f1Count || 0 }
})
