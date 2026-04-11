/** Matches server `INVESTMENT_PACKAGES` / `packageTierFromFirstDepositAmount`. */
export const INVESTMENT_PACKAGES = [300, 500, 1000, 2000, 5000, 10000] as const

/** Highest tier in INVESTMENT_PACKAGES with tier <= amount (min $300). */
export function packageTierFromTotalBalance(amount: number): number | null {
  if (amount < 300) return null
  let best: number | null = null
  for (const t of INVESTMENT_PACKAGES) {
    if (amount >= t) best = t
  }
  return best
}
