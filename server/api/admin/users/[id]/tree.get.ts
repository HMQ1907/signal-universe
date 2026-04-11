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

  /** F1 and parent are independent — run in parallel to cut round-trips. */
  const [f1Res, parentRes] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, full_name, investment_package, created_at, balance')
      .eq('referred_by', userId),
    user.referred_by
      ? supabase
          .from('users')
          .select('id, email, full_name, referral_code')
          .eq('id', user.referred_by)
          .single()
      : Promise.resolve({ data: null as null })
  ])

  const f1 = f1Res.data || []
  const parent = parentRes.data ?? null

  const f1Ids = f1.map(u => u.id)
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

  return { user, parent, f1, f2, f3 }
})
