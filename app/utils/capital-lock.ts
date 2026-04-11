/**
 * Days from first deposit before principal (`withdraw_capital`) is allowed.
 * Server (`getDaysUntilUnlock`) and client previews use this value.
 * Marketing/UI copy may still say "28 days"; eligibility follows this constant.
 */
export const CAPITAL_LOCK_DAYS = 36
