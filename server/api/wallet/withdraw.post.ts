import { z } from 'zod'

const schema = z.object({
  amount: z.number().min(10),
  type: z.enum(['withdraw_profit', 'withdraw_capital'])
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { amount, type } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: fullUser } = await supabase
    .from('users')
    .select('balance, locked_capital, first_deposit_at, wallet_address, wallet_network')
    .eq('id', user.id)
    .single()

  if (!fullUser) throw createError({ statusCode: 404, message: 'User not found' })

  // Wallet address must be configured
  if (!fullUser.wallet_address) {
    throw createError({ statusCode: 400, message: 'Vui lòng cấu hình địa chỉ ví rút tiền trong phần Cài đặt trước.' })
  }

  if (type === 'withdraw_profit') {
    if (amount > fullUser.balance) {
      throw createError({ statusCode: 400, message: 'Số dư không đủ để rút' })
    }
  } else {
    if (!fullUser.first_deposit_at) {
      throw createError({ statusCode: 400, message: 'Không có vốn để rút' })
    }
    const daysLeft = getDaysUntilUnlock(fullUser.first_deposit_at)
    if (daysLeft > 0) {
      throw createError({ statusCode: 400, message: `Vốn còn bị khóa ${daysLeft} ngày` })
    }
    if (amount > fullUser.locked_capital) {
      throw createError({ statusCode: 400, message: 'Số vốn không đủ để rút' })
    }
  }

  const fee = amount * 0.03
  const netAmount = amount - fee

  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    amount,
    status: 'pending',
    withdraw_address: fullUser.wallet_address,
    withdraw_fee: fee,
    network: fullUser.wallet_network || 'TRC20',
    admin_note: `Net: $${netAmount.toFixed(2)} sau phí 3%. Ví: ${fullUser.wallet_address}`
  })

  if (error) throw createError({ statusCode: 500, message: 'Gửi yêu cầu rút tiền thất bại' })

  return { success: true, message: `Yêu cầu rút $${netAmount.toFixed(2)} đã gửi. Chờ admin duyệt.` }
})
