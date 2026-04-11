import { packageTierFromFirstDepositAmount, roundMoney2 } from '~~/server/utils/helpers'
import { sendDepositConfirmationEmail } from '~~/server/utils/email'
import { createNotification } from '~~/server/utils/supabase'

/**
 * First completed deposit: principal → locked_capital only (not balance). Package tier from first deposit amount.
 * Profit balance (`balance`) is for withdraw_profit; principal is withdrawn via withdraw_capital after lock.
 * Later deposits: increase profit balance only; locked_capital and investment_package unchanged.
 * Deposit referral (F1 5%, F2 3% by default): on every completed deposit of the member, from that deposit amount.
 *
 * @param opts.depositTxId — store on deposit_referral rows so admin reject can reverse F1/F2.
 */
export async function applyApprovedDepositCredits(
  supabase: any,
  user: any,
  depositAmount: number,
  opts?: { depositTxId?: number }
) {
  const isFirstDeposit = !user.first_deposit_at

  let newLockedCapital = user.locked_capital || 0
  let newBalance = user.balance || 0

  if (isFirstDeposit) {
    newLockedCapital += depositAmount
    // Do not add principal to `balance` — otherwise user could withdraw it as "profit" immediately.
  } else {
    newBalance += depositAmount
  }

  const updateData: Record<string, unknown> = {
    locked_capital: newLockedCapital,
    balance: newBalance
  }

  if (isFirstDeposit) {
    const pkg = packageTierFromFirstDepositAmount(depositAmount)
    if (pkg == null) {
      throw new Error('First deposit below minimum tier ($300)')
    }
    updateData.investment_package = pkg
    updateData.first_deposit_at = new Date().toISOString()
    updateData.first_deposit_amount = depositAmount
  }

  await supabase.from('users').update(updateData).eq('id', user.id)

  const tierForEmail = isFirstDeposit
    ? (updateData.investment_package as number)
    : (user.investment_package ?? 0)
  sendDepositConfirmationEmail(user.email, depositAmount, tierForEmail).catch(e => console.error('Failed to send deposit email:', e))

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['deposit_referral_f1', 'deposit_referral_f2'])

  const settingsMap: Record<string, number> = {}
  for (const s of settings || []) settingsMap[s.key] = Number(s.value)
  const rateF1 = (settingsMap.deposit_referral_f1 || 5) / 100
  const rateF2 = (settingsMap.deposit_referral_f2 || 3) / 100

  const ancestorIds: number[] = []
  let cur: number | null = user.referred_by
  while (cur) {
    ancestorIds.push(cur)
    const { data: p } = await supabase.from('users').select('referred_by').eq('id', cur).single()
    cur = p?.referred_by ?? null
  }

  const srcId = opts?.depositTxId

  if (ancestorIds.length >= 1) {
    await payOneDepositReferral(
      supabase,
      ancestorIds[0]!,
      user,
      depositAmount,
      rateF1,
      1,
      'F1 deposit',
      srcId
    )
  }
  if (ancestorIds.length >= 2) {
    await payOneDepositReferral(
      supabase,
      ancestorIds[1]!,
      user,
      depositAmount,
      rateF2,
      2,
      'F2 deposit',
      srcId
    )
  }
}

async function payOneDepositReferral(
  supabase: any,
  earnerId: number,
  fromUser: any,
  depositAmount: number,
  rate: number,
  referralLevel: number,
  label: string,
  sourceDepositId?: number
) {
  const commission = roundMoney2(depositAmount * rate)
  if (commission <= 0) return

  const { data: earner } = await supabase.from('users').select('id, balance, email').eq('id', earnerId).single()
  if (!earner) return

  await supabase.from('users').update({ balance: earner.balance + commission }).eq('id', earner.id)

  await supabase.from('transactions').insert({
    user_id: earner.id,
    type: 'deposit_referral',
    amount: commission,
    status: 'completed',
    from_user_id: fromUser.id,
    referral_level: referralLevel,
    source_deposit_id: sourceDepositId ?? null,
    admin_note: `${rate * 100}% ${label} from ${fromUser.email} deposit $${depositAmount}`
  })

  await createNotification(
    earner.id,
    'Deposit referral commission',
    `You earned $${commission.toFixed(2)} (${rate * 100}%) from ${label}: ${fromUser.email} deposit $${depositAmount.toFixed(2)}.`
  )
}

/**
 * Undo credits from a pending deposit when admin rejects (wrong TX id, etc.).
 * Reverses member balance/capital and any F1/F2 deposit_referral linked via source_deposit_id.
 */
export async function revertDepositCredits(
  supabase: any,
  depositTx: {
    id: number
    amount: number
    user_id: number
    is_first_deposit?: boolean | null
    created_at?: string
  }
) {
  const { data: user } = await supabase
    .from('users')
    .select('id, balance, locked_capital, investment_package, first_deposit_at, first_deposit_amount')
    .eq('id', depositTx.user_id)
    .single()

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const { data: earliest } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', depositTx.user_id)
    .eq('type', 'deposit')
    .in('status', ['pending', 'completed'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const amt = Number(depositTx.amount)
  const isFirst =
    depositTx.is_first_deposit === true ||
    (depositTx.is_first_deposit !== false &&
      earliest?.id === depositTx.id &&
      user.first_deposit_amount != null &&
      Math.abs(Number(user.first_deposit_amount) - amt) < 0.01)

  if (isFirst) {
    await supabase
      .from('users')
      .update({
        locked_capital: Math.max(0, Number(user.locked_capital || 0) - amt),
        investment_package: null,
        first_deposit_at: null,
        first_deposit_amount: null
      })
      .eq('id', user.id)
  } else {
    await supabase
      .from('users')
      .update({
        balance: Math.max(0, Number(user.balance || 0) - amt)
      })
      .eq('id', user.id)
  }

  const { data: refTxs } = await supabase
    .from('transactions')
    .select('id, user_id, amount')
    .eq('source_deposit_id', depositTx.id)
    .eq('type', 'deposit_referral')
    .eq('status', 'completed')

  for (const rt of refTxs || []) {
    const { data: earner } = await supabase.from('users').select('balance').eq('id', rt.user_id).single()
    if (earner) {
      await supabase
        .from('users')
        .update({ balance: Math.max(0, Number(earner.balance || 0) - Number(rt.amount)) })
        .eq('id', rt.user_id)
    }
    await supabase.from('transactions').update({ status: 'cancelled' }).eq('id', rt.id)
  }
}
