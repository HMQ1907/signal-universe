import { z } from 'zod'
import { isValidPackage } from '~/server/utils/helpers'

const schema = z.object({
  amount: z.number().min(200),
  package_selected: z.number()
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { amount, package_selected } = parsed.data

  if (!isValidPackage(package_selected)) {
    throw createError({ statusCode: 400, message: 'Invalid package selected' })
  }

  if (amount < package_selected) {
    throw createError({ statusCode: 400, message: `Minimum deposit for this package is $${package_selected}` })
  }

  const supabase = getSupabaseAdmin()

  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .limit(1)

  if (existing && existing.length > 0) {
    throw createError({ statusCode: 400, message: 'You already have a pending deposit request' })
  }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['trc20_wallet_address'])

  const walletAddress = settings?.find(s => s.key === 'trc20_wallet_address')?.value || ''

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type: 'deposit',
      amount,
      status: 'pending',
      network: 'TRC20',
      wallet_address: walletAddress,
      package_selected
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: 'Failed to create deposit request' })
  }

  return { success: true, transaction_id: tx.id, wallet_address: walletAddress }
})
