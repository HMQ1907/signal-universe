import { getMondayOfWeek, getLeaderLevel, getLeaderBonus } from '~/server/utils/helpers'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)
  const weekStart = body.week_start || getMondayOfWeek()

  const supabase = getSupabaseAdmin()

  const { data: users } = await supabase
    .from('users')
    .select('id, email, balance')
    .eq('is_admin', false)
    .eq('is_active', true)

  let generated = 0
  let skipped = 0

  for (const user of users || []) {
    const { count: f1Count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', user.id)

    const directF1 = f1Count || 0
    const level = getLeaderLevel(directF1)

    if (level === 0) { skipped++; continue }

    const bonus = getLeaderBonus(level)

    const { error } = await supabase.from('leader_bonus_records').upsert({
      user_id: user.id, week_start: weekStart, f1_count: directF1,
      leader_level: level, amount: bonus, status: 'pending'
    }, { onConflict: 'user_id,week_start', ignoreDuplicates: true })

    if (!error) generated++
    else skipped++
  }

  await logAdminAction(admin.id, 'generate_leader_bonus', { note: `Week: ${weekStart}, Generated: ${generated}` })

  return { success: true, generated, skipped, week_start: weekStart }
})
