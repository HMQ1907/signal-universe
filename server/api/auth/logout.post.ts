export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (token) {
    const supabase = getSupabaseAdmin()
    await supabase.from('sessions').delete().eq('token', token)
    deleteCookie(event, 'auth_token', { path: '/' })
  }
  return { success: true }
})
