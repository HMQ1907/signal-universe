export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const recordId = Number(getRouterParam(event, 'id'))
  const supabase = getSupabaseAdmin()

  const { data: record } = await supabase
    .from('leader_bonus_records')
    .select('*, user:users(id, balance, email)')
    .eq('id', recordId)
    .eq('status', 'pending')
    .single()

  if (!record) throw createError({ statusCode: 404, message: 'Record not found' })

  const user = record.user as any

  await supabase.from('users').update({ balance: user.balance + record.amount }).eq('id', user.id)
  await supabase.from('leader_bonus_records').update({
    status: 'paid', paid_at: new Date().toISOString(), paid_by: admin.id
  }).eq('id', recordId)

  await supabase.from('transactions').insert({
    user_id: user.id, type: 'leader_bonus', amount: record.amount, status: 'completed'
  })

  await createNotification(user.id, 'Leader Bonus Paid', `Your Leader ${record.leader_level} weekly bonus of $${record.amount} has been credited to your account.`)

  return { success: true }
})
