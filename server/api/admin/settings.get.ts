export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('site_settings').select('*').order('key')
  return data || []
})
