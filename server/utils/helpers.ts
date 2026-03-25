import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

export function generateToken(): string {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 64)()
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateReferralCode(): string {
  return nanoid()
}

export function getClientIp(event: import('h3').H3Event): string {
  return (
    getRequestHeader(event, 'cf-connecting-ip') ||
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0] ||
    getRequestHeader(event, 'x-real-ip') ||
    'unknown'
  )
}

export const INVESTMENT_PACKAGES = [200, 300, 500, 1000, 2000, 5000] as const
export type InvestmentPackage = (typeof INVESTMENT_PACKAGES)[number]

export function isValidPackage(amount: number): amount is InvestmentPackage {
  return INVESTMENT_PACKAGES.includes(amount as InvestmentPackage)
}

export function getLeaderLevel(f1Count: number): number {
  if (f1Count >= 200) return 5
  if (f1Count >= 100) return 4
  if (f1Count >= 50) return 3
  if (f1Count >= 20) return 2
  if (f1Count >= 10) return 1
  return 0
}

export function getLeaderBonus(level: number): number {
  const bonuses: Record<number, number> = { 1: 50, 2: 100, 3: 200, 4: 500, 5: 1000 }
  return bonuses[level] || 0
}

export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function isWithdrawWindowOpen(): boolean {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 22
}

export function isSignalWindowOpen(timeWindow: '14:00' | '21:00'): boolean {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentMinutes = hours * 60 + minutes
  const [wHours, wMins] = timeWindow.split(':').map(Number)
  const windowStart = wHours * 60 + wMins
  const windowEnd = windowStart + 20
  return currentMinutes >= windowStart && currentMinutes < windowEnd
}

export function getDaysUntilUnlock(firstDepositAt: string): number {
  const first = new Date(firstDepositAt)
  const unlock = new Date(first.getTime() + 28 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diff = unlock.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

export function isCapitalUnlocked(firstDepositAt: string | null): boolean {
  if (!firstDepositAt) return false
  return getDaysUntilUnlock(firstDepositAt) === 0
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}
