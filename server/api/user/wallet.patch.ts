import { z } from 'zod'

const schema = z.object({
  wallet_address: z.string().max(255),
  wallet_network: z.enum(['TRC20', 'BEP20'])
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0]?.message || 'Invalid input' })
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('users')
    .update({ wallet_address: parsed.data.wallet_address, wallet_network: parsed.data.wallet_network })
    .eq('id', user.id)

  if (error) throw createError({ statusCode: 500, message: 'Lưu địa chỉ ví thất bại' })

  return { success: true }
})
