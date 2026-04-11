import { roundMoney2 } from '~~/server/utils/helpers'
import { createNotification } from '~~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const confirmationId = Number(getRouterParam(event, 'id'))
  await readBody(event).catch(() => ({}))

  const supabase = getSupabaseAdmin()
  const { data: confirmation } = await supabase
    .from('signal_confirmations')
    .select('*, user:users!signal_confirmations_user_id_fkey(*)')
    .eq('id', confirmationId)
    .eq('status', 'pending')
    .single()

  if (!confirmation) throw createError({ statusCode: 404, message: 'Confirmation not found' })

  const user = confirmation.user as any
  const packageTier = confirmation.package_tier || 300

  /** Profit locked at confirm time: 2% of total balance, stored in confirmation.amount */
  const profitAmount = roundMoney2(Number(confirmation.amount))

  const { data: freshUser } = await supabase.from('users').select('balance').eq('id', user.id).single()
  const currentBalance = freshUser?.balance ?? user.balance ?? 0

  await supabase.from('users').update({ balance: roundMoney2(currentBalance + profitAmount) }).eq('id', user.id)

  await supabase.from('signal_confirmations').update({
    profit_amount: profitAmount,
    status: 'approved',
    processed_by: admin.id,
    processed_at: new Date().toISOString()
  }).eq('id', confirmationId)

  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'signal_profit',
    amount: profitAmount,
    status: 'completed',
    signal_session_id: confirmation.session_id
  })

  const { data: profitSettings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['signal_referral_f1', 'signal_referral_f2', 'signal_referral_f3'])

  const settingsMap: Record<string, number> = {}
  for (const s of profitSettings || []) settingsMap[s.key] = Number(s.value)

  const rates = [
    (settingsMap.signal_referral_f1 || 15) / 100,
    (settingsMap.signal_referral_f2 || 10) / 100,
    (settingsMap.signal_referral_f3 || 5) / 100
  ]

  let uplineId: number | null = user.referred_by
  for (let i = 0; i < 3 && uplineId; i++) {
    const { data: upline } = await supabase
      .from('users')
      .select('id, balance, referred_by')
      .eq('id', uplineId)
      .single()

    if (!upline) break

    const commission = roundMoney2(profitAmount * rates[i])
    if (commission > 0) {
      await supabase.from('users').update({ balance: roundMoney2(upline.balance + commission) }).eq('id', upline.id)
      await supabase.from('transactions').insert({
        user_id: upline.id,
        type: 'signal_referral',
        amount: commission,
        status: 'completed',
        from_user_id: user.id,
        referral_level: i + 1,
        signal_session_id: confirmation.session_id,
        admin_note: `AI confirm referral ${(rates[i] * 100).toFixed(0)}% of profit $${profitAmount} (upline ${i + 1})`
      })
      await createNotification(
        upline.id,
        'AI confirm referral',
        `You earned $${commission.toFixed(2)} (${(rates[i] * 100).toFixed(0)}% of $${profitAmount} profit) from ${user.email}'s AI confirm.`
      )
    }
    uplineId = upline.referred_by
  }

  await createNotification(
    user.id,
    'Signal Profit Approved',
    `Your AI confirm profit of $${profitAmount.toFixed(2)} (2% of total balance at confirm time) has been credited. Package tier $${packageTier}.`
  )

  return { success: true, profit_amount: profitAmount, package_tier: packageTier }
})
