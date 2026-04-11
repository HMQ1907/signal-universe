import { z } from 'zod'
import { applyApprovedDepositCredits } from '~~/server/utils/depositApproval'

const schema = z.object({
  amount: z.number().min(300),
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
  const supabase = getSupabaseAdmin() as any

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

  const walletAddress = String((settings?.[0] as { value?: string } | undefined)?.value ?? '')
  if (!walletAddress.trim()) {
    throw createError({ statusCode: 400, message: 'Deposit wallet is not configured for this network' })
  }

  const { data: dbUser, error: userErr } = await supabase
    .from('users')
    .select('id, email, balance, locked_capital, referred_by, investment_package, first_deposit_at')
    .eq('id', user.id)
    .single()

  if (userErr || !dbUser) {
    throw createError({ statusCode: 500, message: 'Failed to load user' })
  }

  const isFirstDeposit = !dbUser.first_deposit_at

  const { data: inserted, error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: 'deposit',
      amount,
      status: 'pending',
      network,
      wallet_address: walletAddress,
      tx_hash,
      is_first_deposit: isFirstDeposit,
      admin_note: `TX: ${tx_hash} — credited; pending admin verification`
    })
    .select('id')
    .single()

  if (txError || !inserted?.id) {
    throw createError({ statusCode: 500, message: 'Failed to record deposit' })
  }

  try {
    await applyApprovedDepositCredits(supabase, dbUser, amount, { depositTxId: inserted.id })
  } catch (e) {
    console.error(e)
    await supabase.from('transactions').delete().eq('id', inserted.id)
    throw createError({ statusCode: 500, message: 'Failed to apply deposit credit' })
  }

  return { success: true, message: 'Deposit recorded; balance updated pending TX verification', amount, pending: true }
})
