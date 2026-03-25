import { z } from 'zod'

const schema = z.object({
  profit_percent: z.number().min(0).max(2)
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const confirmationId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid input' })

  const supabase = getSupabaseAdmin()
  const { data: confirmation } = await supabase
    .from('signal_confirmations')
    .select('*, user:users(*)')
    .eq('id', confirmationId)
    .eq('status', 'pending')
    .single()

  if (!confirmation) throw createError({ statusCode: 404, message: 'Confirmation not found' })

  const user = confirmation.user as any
  const profitAmount = parseFloat((confirmation.balance_snapshot * parsed.data.profit_percent / 100).toFixed(2))

  await supabase.from('users').update({ balance: user.balance + profitAmount }).eq('id', user.id)

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

  // Process compound interest (lãi chồng lãi): F1 15%, F2 10%, F3 5%
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['signal_referral_f1', 'signal_referral_f2', 'signal_referral_f3'])

  const settingsMap: Record<string, number> = {}
  for (const s of settings || []) settingsMap[s.key] = Number(s.value)
  const f1Rate = (settingsMap.signal_referral_f1 || 15) / 100
  const f2Rate = (settingsMap.signal_referral_f2 || 10) / 100
  const f3Rate = (settingsMap.signal_referral_f3 || 5) / 100

  // F1 (direct upline of user)
  if (user.referred_by) {
    const { data: f1User } = await supabase.from('users').select('id, balance, referred_by').eq('id', user.referred_by).single()
    if (f1User) {
      const f1Commission = parseFloat((profitAmount * f1Rate).toFixed(2))
      await supabase.from('users').update({ balance: f1User.balance + f1Commission }).eq('id', f1User.id)
      await supabase.from('transactions').insert({
        user_id: f1User.id, type: 'signal_referral', amount: f1Commission, status: 'completed',
        from_user_id: user.id, referral_level: 1, signal_session_id: confirmation.session_id
      })
      await createNotification(f1User.id, 'Referral Profit', `You earned $${f1Commission.toFixed(2)} compound interest from your F1 member`)

      // F2
      if (f1User.referred_by) {
        const { data: f2User } = await supabase.from('users').select('id, balance, referred_by').eq('id', f1User.referred_by).single()
        if (f2User) {
          const f2Commission = parseFloat((profitAmount * f2Rate).toFixed(2))
          await supabase.from('users').update({ balance: f2User.balance + f2Commission }).eq('id', f2User.id)
          await supabase.from('transactions').insert({
            user_id: f2User.id, type: 'signal_referral', amount: f2Commission, status: 'completed',
            from_user_id: user.id, referral_level: 2, signal_session_id: confirmation.session_id
          })
          await createNotification(f2User.id, 'Referral Profit', `You earned $${f2Commission.toFixed(2)} compound interest (F2)`)

          // F3
          if (f2User.referred_by) {
            const { data: f3User } = await supabase.from('users').select('id, balance').eq('id', f2User.referred_by).single()
            if (f3User) {
              const f3Commission = parseFloat((profitAmount * f3Rate).toFixed(2))
              await supabase.from('users').update({ balance: f3User.balance + f3Commission }).eq('id', f3User.id)
              await supabase.from('transactions').insert({
                user_id: f3User.id, type: 'signal_referral', amount: f3Commission, status: 'completed',
                from_user_id: user.id, referral_level: 3, signal_session_id: confirmation.session_id
              })
              await createNotification(f3User.id, 'Referral Profit', `You earned $${f3Commission.toFixed(2)} compound interest (F3)`)
            }
          }
        }
      }
    }
  }

  await createNotification(user.id, 'Signal Profit Approved', `Your signal profit of $${profitAmount.toFixed(2)} has been credited to your account.`)

  return { success: true, profit_amount: profitAmount }
})
