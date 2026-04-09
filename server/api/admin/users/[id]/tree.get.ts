export default defineEventHandler(async (event) => {
  await requireAdminOrSubAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, email, full_name, referral_code, referred_by')
    .eq('id', userId)
    .single()

  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const { data: f1 } = await supabase
    .from('users')
    .select('id, email, full_name, investment_package, created_at, balance')
    .eq('referred_by', userId)

  const f1Ids = f1?.map(u => u.id) || []
  let f2: any[] = []
  let f3: any[] = []

  if (f1Ids.length > 0) {
    const { data: f2Data } = await supabase
      .from('users')
      .select('id, email, full_name, investment_package, created_at, balance, referred_by')
      .in('referred_by', f1Ids)
    f2 = f2Data || []

    const f2Ids = f2.map(u => u.id)
    if (f2Ids.length > 0) {
      const { data: f3Data } = await supabase
        .from('users')
        .select('id, email, full_name, investment_package, created_at, balance, referred_by')
        .in('referred_by', f2Ids)
      f3 = f3Data || []
    }
  }

  let parent = null
  if (user.referred_by) {
    const { data: parentUser } = await supabase
      .from('users')
      .select('id, email, full_name, referral_code')
      .eq('id', user.referred_by)
      .single()
    parent = parentUser
  }

  return { user, parent, f1: f1 || [], f2, f3 }
})
