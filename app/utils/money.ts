/** Client-safe USD rounding (matches server roundMoney2). */
export function roundMoney2(n: number): number {
  return Math.round(n * 100) / 100
}
