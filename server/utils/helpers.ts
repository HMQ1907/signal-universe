import { customAlphabet } from 'nanoid'
import bcrypt from 'bcryptjs'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

const SESSION_DAYS = 30
const OTP_TTL_MS = 15 * 60 * 1000

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export function validatePassword(password: string): { valid: true } | { valid: false; message: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  return { valid: true }
}

export function getPaginationParams(query: Record<string, unknown>): { page: number; limit: number } {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1)
  const rawLimit = Number.parseInt(String(query.limit ?? '20'), 10) || 20
  const limit = Math.min(100, Math.max(1, rawLimit))
  return { page, limit }
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  opts: { page: number; limit: number }
) {
  return {
    data,
    total,
    page: opts.page,
    limit: opts.limit,
    totalPages: Math.max(1, Math.ceil(total / opts.limit))
  }
}

/** Alias for auth session token (same as login). */
export function generateSessionToken(): string {
  return generateToken()
}

export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
}

/** 6-digit OTP (same as generateOtpCode). */
export function generateOtp(): string {
  return generateOtpCode()
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS)
}

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

/** Allowed DeFi tiers (USD); highest tier where total balance >= tier applies */
export const PACKAGE_TIERS_DESC = [5000, 2000, 1000, 500, 300, 200] as const

export const INVESTMENT_PACKAGES = [200, 300, 500, 1000, 2000, 5000] as const
export type InvestmentPackage = (typeof INVESTMENT_PACKAGES)[number]

export function isValidPackage(amount: number): amount is InvestmentPackage {
  return INVESTMENT_PACKAGES.includes(amount as InvestmentPackage)
}

/** Total = profit balance + locked capital. Returns null if below $200 (no DeFi tier). */
export function investmentTierFromTotal(total: number): number | null {
  if (total < 200) return null
  for (const t of PACKAGE_TIERS_DESC) {
    if (total >= t) return t
  }
  return 200
}

export function isWithdrawWindowOpen(): boolean {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 22
}

/** AI confirm button: 11:00–23:59 local server time (same TZ as withdraw helpers). */
export function isDailyAiConfirmWindowOpen(): boolean {
  const now = new Date()
  const h = now.getHours()
  return h >= 11 && h <= 23
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
