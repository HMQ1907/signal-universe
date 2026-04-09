import { z } from 'zod'

const schema = z.object({
  amount: z.number().positive(),
  operation: z.enum(['add', 'subtract']),
  target: z.enum(['balance', 'capital']).default('balance'),
  reason: z.string().min(3)
})

export default defineEventHandler(async (event) => {
  const admin = await requireMainAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) throw createError({ statusCode: 400, message: 'Invalid input' })

  const { amount, operation, target, reason } = parsed.data
  const supabase = getSupabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('balance, locked_capital')
    .eq('id', userId)
    .single()

  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const currentValue = target === 'capital' ? user.locked_capital : user.balance
  if (operation === 'subtract' && currentValue < amount) {
    throw createError({ statusCode: 400, message: 'Insufficient balance' })
  }

  const newValue = operation === 'add' ? currentValue + amount : currentValue - amount
  const adjustAmount = operation === 'add' ? amount : -amount

  const updateField = target === 'capital' ? { locked_capital: newValue } : { balance: newValue }
  await supabase.from('users').update(updateField).eq('id', userId)

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'admin_adjust',
    amount,
    status: 'completed',
    admin_note: reason,
    adjust_reason: `[${target}] ${operation}: ${reason}`,
    processed_by: admin.id,
    processed_at: new Date().toISOString()
  })

  await logAdminAction(admin.id, 'adjust_balance', {
    targetUserId: userId,
    oldValue: currentValue.toString(),
    newValue: newValue.toString(),
    amountChange: adjustAmount,
    note: `[${target}] ${reason}`
  })

  await createNotification(
    userId,
    'Balance Adjusted',
    `Your ${target === 'capital' ? 'capital' : 'profit balance'} has been ${operation === 'add' ? 'credited' : 'debited'} by $${amount}. Reason: ${reason}`
  )

  return { success: true, new_value: newValue }
})
