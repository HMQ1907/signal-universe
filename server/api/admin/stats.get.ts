export default defineEventHandler(async (event) => {
  await requireAdminOrSubAdmin(event)
  const supabase = getSupabaseAdmin()

  const [
    { count: totalUsers },
    { count: activeUsers },
    { data: deposits },
    { data: withdrawals },
    { count: pendingDeposits },
    { count: pendingWithdrawals },
    { data: balances }
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_admin', false),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_admin', false).eq('is_active', true),
    supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'completed'),
    supabase.from('transactions').select('amount').in('type', ['withdraw_profit', 'withdraw_capital']).eq('status', 'completed'),
    supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'pending'),
    supabase.from('transactions').select('id', { count: 'exact', head: true }).in('type', ['withdraw_profit', 'withdraw_capital']).eq('status', 'pending'),
    supabase.from('users').select('balance, locked_capital').eq('is_admin', false)
  ])


  console.log(deposits, withdrawals, balances)
  const totalDeposited = deposits?.reduce((s, t) => s + t.amount, 0) || 0
  const totalWithdrawn = withdrawals?.reduce((s, t) => s + t.amount, 0) || 0
  const totalBalance = balances?.reduce((s, u) => s + u.balance + u.locked_capital, 0) || 0

  return {
    total_users: totalUsers || 0,
    active_users: activeUsers || 0,
    total_deposited: totalDeposited,
    total_withdrawn: totalWithdrawn,
    pending_deposits: pendingDeposits || 0,
    pending_withdrawals: pendingWithdrawals || 0,
    total_user_balance: totalBalance
  }
})
