export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase.from('users').select('is_active, email').eq('id', userId).single()
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  await supabase.from('users').update({ is_active: !user.is_active }).eq('id', userId)
  await logAdminAction(admin.id, 'toggle_user_status', {
    targetUserId: userId,
    oldValue: user.is_active.toString(),
    newValue: (!user.is_active).toString()
  })

  return { success: true, is_active: !user.is_active }
})
