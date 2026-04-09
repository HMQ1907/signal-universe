export default defineEventHandler(async (event) => {
  await requireMainAdmin(event)
  const supabase = getSupabaseAdmin()

  const { data } = await supabase
    .from('users')
    .select('id, email, full_name, is_sub_admin, is_active, created_at, last_login_at')
    .eq('is_sub_admin', true)
    .order('created_at', { ascending: false })

  return { data: data || [] }
})
