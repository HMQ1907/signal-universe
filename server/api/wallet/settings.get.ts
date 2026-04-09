export default defineEventHandler(async (event) => {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('site_settings').select('key, value')

  const settings: Record<string, string> = {}
  for (const s of data || []) {
    settings[s.key] = s.value || ''
  }

  return {
    trc20_wallet_address: settings.trc20_wallet_address || '',
    bep20_wallet_address: settings.bep20_wallet_address || '',
    min_deposit: Number(settings.min_deposit || 200),
    min_withdraw: Number(settings.min_withdraw || 10),
    withdraw_fee_percent: Number(settings.withdraw_fee_percent || 3),
    withdraw_time_start: settings.withdraw_time_start || '22:00',
    withdraw_time_end: settings.withdraw_time_end || '24:00'
  }
})
