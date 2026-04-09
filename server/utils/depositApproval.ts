import { investmentTierFromTotal } from '~~/server/utils/helpers'
import { sendDepositConfirmationEmail } from '~~/server/utils/email'
import { createNotification } from '~~/server/utils/supabase'

/**
 * First completed deposit: principal → locked_capital + balance (tier / pool).
 * Later deposits: only increase balance (treated as profit); locked_capital stays the first principal only.
 */
export async function applyApprovedDepositCredits(supabase: any, user: any, depositAmount: number) {
  const isFirstDeposit = !user.first_deposit_at

  let newLockedCapital = user.locked_capital || 0
  const newBalance = (user.balance || 0) + depositAmount

  if (isFirstDeposit) {
    newLockedCapital += depositAmount
  }

  const tier = investmentTierFromTotal(newBalance + newLockedCapital)

  const updateData: any = {
    locked_capital: newLockedCapital,
    investment_package: tier,
    balance: newBalance
  }

  if (isFirstDeposit) {
    updateData.first_deposit_at = new Date().toISOString()
    updateData.first_deposit_amount = depositAmount
  }

  await supabase.from('users').update(updateData).eq('id', user.id)

  sendDepositConfirmationEmail(user.email, depositAmount, tier ?? 0).catch(e => console.error('Failed to send deposit email:', e))

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['deposit_referral_f1', 'deposit_referral_f2'])

  const settingsMap: Record<string, number> = {}
  for (const s of settings || []) settingsMap[s.key] = Number(s.value)
  const rateToParent = (settingsMap.deposit_referral_f1 || 5) / 100
  const rateToGrandparent = (settingsMap.deposit_referral_f2 || 3) / 100

  const ancestorIds: number[] = []
  let cur: number | null = user.referred_by
  while (cur) {
    ancestorIds.push(cur)
    const { data: p } = await supabase.from('users').select('referred_by').eq('id', cur).single()
    cur = p?.referred_by ?? null
  }

  if (ancestorIds.length === 1) {
    await payOneDepositReferral(
      supabase,
      ancestorIds[0],
      user,
      depositAmount,
      rateToParent,
      1,
      'direct referral deposit'
    )
  } else if (ancestorIds.length === 2) {
    await payOneDepositReferral(
      supabase,
      ancestorIds[1],
      user,
      depositAmount,
      rateToGrandparent,
      2,
      '2nd-level referral deposit (grandparent)'
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
  label: string
) {
  const commission = parseFloat((depositAmount * rate).toFixed(2))
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
    admin_note: `${rate * 100}% ${label} from ${fromUser.email} deposit $${depositAmount}`
  })

  await createNotification(
    earner.id,
    'Deposit referral commission',
    `You earned $${commission.toFixed(2)} (${rate * 100}%) from ${label}: ${fromUser.email} deposited $${depositAmount.toFixed(2)}.`
  )
}
