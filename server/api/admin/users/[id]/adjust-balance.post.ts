import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive(),
  operation: z.enum(['add', 'subtract']),
  reason: z.string().min(3)
})

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid input' })

  const { amount, operation, reason } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single()

  if (!user) throw createError({ statusCode: 404, message: 'User not found' })
  if (operation === 'subtract' && user.balance < amount) {
    throw createError({ statusCode: 400, message: 'Insufficient balance' })
  }

  const newBalance = operation === 'add' ? user.balance + amount : user.balance - amount
  const adjustAmount = operation === 'add' ? amount : -amount

  await supabase.from('users').update({ balance: newBalance }).eq('id', userId)

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'admin_adjust',
    amount,
    status: 'completed',
    admin_note: reason,
    adjust_reason: reason,
    processed_by: admin.id,
    processed_at: new Date().toISOString()
  })

  await logAdminAction(admin.id, 'adjust_balance', {
    targetUserId: userId,
    oldValue: user.balance.toString(),
    newValue: newBalance.toString(),
    amountChange: adjustAmount,
    note: reason
  })

  await createNotification(
    userId,
    'Balance Adjusted',
    `Your balance has been ${operation === 'add' ? 'credited' : 'debited'} by $${amount}. Reason: ${reason}`
  )

  return { success: true, new_balance: newBalance }
})
