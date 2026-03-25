export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const txId = Number(getRouterParam(event, 'id'))
  const supabase = getSupabaseAdmin()

  const { data: tx } = await supabase
    .from('transactions')
    .select('*, user:users(*)')
    .eq('id', txId)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .single()

  if (!tx) throw createError({ statusCode: 404, message: 'Transaction not found' })

  const user = tx.user as any
  const isFirstDeposit = !user.first_deposit_at

  const updates: Record<string, any> = {
    locked_capital: user.locked_capital + tx.amount,
    investment_package: tx.package_selected || user.investment_package
  }
  if (isFirstDeposit) updates.first_deposit_at = new Date().toISOString()

  await supabase.from('users').update(updates).eq('id', user.id)

  await supabase.from('transactions')
    .update({ status: 'completed', processed_by: admin.id, processed_at: new Date().toISOString() })
    .eq('id', txId)

  // Process deposit referral commissions (F1: 5%, F2: 3%)
  if (user.referred_by) {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['deposit_referral_f1', 'deposit_referral_f2'])

    const settingsMap: Record<string, number> = {}
    for (const s of settings || []) settingsMap[s.key] = Number(s.value)
    const f1Rate = (settingsMap.deposit_referral_f1 || 5) / 100
    const f2Rate = (settingsMap.deposit_referral_f2 || 3) / 100

    const { data: f1User } = await supabase.from('users').select('id, balance, referred_by').eq('id', user.referred_by).single()
    if (f1User) {
      const f1Commission = parseFloat((tx.amount * f1Rate).toFixed(2))
      await supabase.from('users').update({ balance: f1User.balance + f1Commission }).eq('id', f1User.id)
      await supabase.from('transactions').insert({
        user_id: f1User.id, type: 'deposit_referral', amount: f1Commission, status: 'completed',
        from_user_id: user.id, referral_level: 1
      })
      await createNotification(f1User.id, 'Deposit Commission', `You earned $${f1Commission.toFixed(2)} deposit commission (F1)`)

      if (f1User.referred_by) {
        const { data: f2User } = await supabase.from('users').select('id, balance').eq('id', f1User.referred_by).single()
        if (f2User) {
          const f2Commission = parseFloat((tx.amount * f2Rate).toFixed(2))
          await supabase.from('users').update({ balance: f2User.balance + f2Commission }).eq('id', f2User.id)
          await supabase.from('transactions').insert({
            user_id: f2User.id, type: 'deposit_referral', amount: f2Commission, status: 'completed',
            from_user_id: user.id, referral_level: 2
          })
          await createNotification(f2User.id, 'Deposit Commission', `You earned $${f2Commission.toFixed(2)} deposit commission (F2)`)
        }
      }
    }
  }

  await logAdminAction(admin.id, 'approve_deposit', {
    targetUserId: user.id, targetTransactionId: txId, amountChange: tx.amount
  })

  await createNotification(user.id, 'Deposit Approved', `Your deposit of $${tx.amount} has been approved. Your investment package is now active.`)

  return { success: true }
})
