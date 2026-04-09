export default defineEventHandler(async (event) => {
  await requireMainAdmin(event)
  const targetId = Number(getRouterParam(event, 'id'))
  if (!targetId) throw createError({ statusCode: 400, message: 'Invalid id' })

  const supabase = getSupabaseAdmin()
  const { data: target } = await supabase
    .from('users')
    .select('id, is_sub_admin')
    .eq('id', targetId)
    .single()

  if (!target) throw createError({ statusCode: 404, message: 'User not found' })
  if (!target.is_sub_admin) throw createError({ statusCode: 400, message: 'User is not a sub-admin' })

  await supabase.from('users').update({ is_sub_admin: false }).eq('id', targetId)

  return { success: true }
})
