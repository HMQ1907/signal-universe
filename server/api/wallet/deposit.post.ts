import { z } from 'zod'

const schema = z.object({
  amount: z.number().min(200),
  network: z.enum(['TRC20', 'BEP20']),
  tx_hash: z.string().min(10, 'Transaction ID must be at least 10 characters')
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message || 'Invalid input'
    throw createError({ statusCode: 400, message: msg })
  }

  const { amount, network, tx_hash } = parsed.data
  const supabase = getSupabaseAdmin()

  // Prevent duplicate tx_hash
  const { data: dupTx } = await supabase
    .from('transactions')
    .select('id')
    .eq('tx_hash', tx_hash)
    .limit(1)

  if (dupTx && dupTx.length > 0) {
    throw createError({ statusCode: 400, message: 'Transaction ID already submitted' })
  }

  const settingKey = network === 'TRC20' ? 'trc20_wallet_address' : 'bep20_wallet_address'
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', settingKey)

  const walletAddress = settings?.[0]?.value || ''

  // Auto-credit immediately — admin can deduct later if invalid
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      network,
      wallet_address: walletAddress,
      tx_hash,
      admin_note: `Auto-credited. TX: ${tx_hash}`
    })

  if (txError) {
    throw createError({ statusCode: 500, message: 'Failed to record deposit' })
  }

  // Credit balance + lock capital immediately
  const isFirstDeposit = !user.first_deposit_at
  const updatePayload: Record<string, unknown> = {
    locked_capital: supabase.rpc('increment_column', { row_id: user.id, col: 'locked_capital', val: amount }),
    investment_package: amount
  }

  // Simpler approach: direct update
  const { data: currentUser } = await supabase
    .from('users')
    .select('locked_capital, investment_package, first_deposit_at')
    .eq('id', user.id)
    .single()

  const newCapital = (currentUser?.locked_capital || 0) + amount
  const newPackage = Math.max(currentUser?.investment_package || 0, amount)

  await supabase
    .from('users')
    .update({
      locked_capital: newCapital,
      investment_package: newPackage,
      ...(isFirstDeposit || !currentUser?.first_deposit_at
        ? { first_deposit_at: new Date().toISOString() }
        : {})
    })
    .eq('id', user.id)

  return { success: true, message: 'Deposit credited successfully', amount }
})
