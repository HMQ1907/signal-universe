import { customAlphabet } from 'nanoid'
import bcrypt from 'bcryptjs'
import { CAPITAL_LOCK_DAYS } from '../../app/utils/capital-lock'
import { isAiConfirmWindowOpenAt } from '../../app/utils/aiConfirmWindow'

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
export const PACKAGE_TIERS_DESC = [10000, 5000, 2000, 1000, 500, 300] as const

export const INVESTMENT_PACKAGES = [300, 500, 1000, 2000, 5000, 10000] as const
export type InvestmentPackage = (typeof INVESTMENT_PACKAGES)[number]

export function isValidPackage(amount: number): amount is InvestmentPackage {
  return INVESTMENT_PACKAGES.includes(amount as InvestmentPackage)
}

/** Round USD to 2 decimals (half-up: 1.014 → 1.01, 1.016 → 1.02). */
export function roundMoney2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Package tier locked at first deposit: highest tier in INVESTMENT_PACKAGES with tier <= amount
 * (e.g. $1,000 → 1000, $750 → 500). Null if below minimum $300.
 */
export function packageTierFromFirstDepositAmount(amount: number): number | null {
  if (amount < 300) return null
  let best: number | null = null
  for (const t of INVESTMENT_PACKAGES) {
    if (amount >= t) best = t
  }
  return best
}

/** Total = profit balance + locked capital. Returns null if below $300 (no DeFi tier). */
export function investmentTierFromTotal(total: number): number | null {
  if (total < 300) return null
  for (const t of PACKAGE_TIERS_DESC) {
    if (total >= t) return t
  }
  return 300
}

export function isWithdrawWindowOpen(): boolean {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 22
}

/**
 * AI confirm window (local server time; same TZ as withdraw helpers).
 * If `TEST_AI=true` in env: 00:00–22:50. Otherwise: 00:00–14:59 (hour 0–14 inclusive).
 */
export function isDailyAiConfirmWindowOpen(): boolean {
  const testAi = process.env.TEST_AI === 'true'
  return isAiConfirmWindowOpenAt(new Date(), testAi)
}

export function getDaysUntilUnlock(firstDepositAt: string): number {
  const first = new Date(firstDepositAt)
  const unlock = new Date(first.getTime() + CAPITAL_LOCK_DAYS * 24 * 60 * 60 * 1000)
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
