import { z } from 'zod'
import { getDaysUntilUnlock } from '~/server/utils/helpers'

const schema = z.object({
  amount: z.number().min(10),
  withdraw_address: z.string().min(10),
  type: z.enum(['withdraw_profit', 'withdraw_capital'])
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { amount, withdraw_address, type } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: fullUser } = await supabase
    .from('users')
    .select('balance, locked_capital, first_deposit_at, investment_package')
    .eq('id', user.id)
    .single()

  if (!fullUser) throw createError({ statusCode: 404, message: 'User not found' })

  if (type === 'withdraw_profit') {
    if (amount > fullUser.balance) {
      throw createError({ statusCode: 400, message: 'Insufficient profit balance' })
    }
  } else {
    if (!fullUser.first_deposit_at) {
      throw createError({ statusCode: 400, message: 'No capital to withdraw' })
    }
    const daysLeft = getDaysUntilUnlock(fullUser.first_deposit_at)
    if (daysLeft > 0) {
      throw createError({ statusCode: 400, message: `Capital locked for ${daysLeft} more days` })
    }
    if (amount > fullUser.locked_capital) {
      throw createError({ statusCode: 400, message: 'Insufficient capital balance' })
    }
  }

  const fee = amount * 0.03
  const netAmount = amount - fee

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    amount,
    status: 'pending',
    withdraw_address,
    withdraw_fee: fee,
    admin_note: `Net: $${netAmount.toFixed(2)} after 3% fee`
  })

  if (error) throw createError({ statusCode: 500, message: 'Failed to create withdrawal request' })

  return { success: true, message: 'Withdrawal request submitted successfully.' }
})
