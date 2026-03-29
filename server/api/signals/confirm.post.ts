import { z } from 'zod'
import { investmentTierFromTotal, isDailyAiConfirmWindowOpen } from '~~/server/utils/helpers'

const schema = z.object({
  session_id: z.number()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const supabase = getSupabaseAdmin()
  const { data: session } = await supabase
    .from('signal_sessions')
    .select('*')
    .eq('id', parsed.data.session_id)
    .single()

  if (!session) throw createError({ statusCode: 404, message: 'Session not found' })
  if (session.status !== 'open') throw createError({ statusCode: 400, message: 'Session is not open' })

  const today = new Date().toISOString().split('T')[0]
  if (session.session_date !== today) {
    throw createError({ statusCode: 400, message: 'Session is not for today' })
  }

  if (!isDailyAiConfirmWindowOpen()) {
    throw createError({ statusCode: 400, message: 'AI confirm window is closed (open 11:00–23:59)' })
  }

  const { data: fullUser } = await supabase
    .from('users')
    .select('balance, locked_capital')
    .eq('id', user.id)
    .single()

  if (!fullUser || fullUser.balance < 1) {
    throw createError({ statusCode: 400, message: 'Insufficient balance' })
  }

  const totalForTier = (fullUser.balance || 0) + (fullUser.locked_capital || 0)
  const packageTier = investmentTierFromTotal(totalForTier)
  if (!packageTier) {
    throw createError({ statusCode: 400, message: 'Minimum $200 total balance required for DeFi / AI confirm' })
  }

  const { data: existing } = await supabase
    .from('signal_confirmations')
    .select('id')
    .eq('user_id', user.id)
    .eq('session_id', session.id)
    .single()

  if (existing) throw createError({ statusCode: 400, message: 'Already confirmed this session' })

  const signalAmount = parseFloat((fullUser.balance * 0.01).toFixed(2))

  const { error } = await supabase.from('signal_confirmations').insert({
    user_id: user.id,
    session_id: session.id,
    amount: signalAmount,
    package_tier: packageTier,
    balance_snapshot: fullUser.balance,
    status: 'pending'
  })

  if (error) throw createError({ statusCode: 500, message: 'Failed to confirm signal' })

  return { success: true, amount: signalAmount, package_tier: packageTier }
})
