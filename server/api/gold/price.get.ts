import { cacheGet, cacheSet, TTL } from '~~/server/utils/cache'

const CACHE_KEY = 'gold_price'

export default defineEventHandler(async () => {
  // Return cached price if available
  const cached = cacheGet<GoldPrice>(CACHE_KEY)
  if (cached) return cached

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true'
    )

    if (!response.ok) {
      throw new Error('Failed to fetch gold price from CoinGecko')
    }

    const data = await response.json()
    const price = data['pax-gold']?.usd || 2650
    const change24h = data['pax-gold']?.usd_24h_change || 0

    const result: GoldPrice = {
      symbol: 'XAU/USD',
      price,
      change24h: parseFloat(change24h.toFixed(2)),
      currency: 'USD',
      unit: 'oz',
      timestamp: new Date().toISOString()
    }

    cacheSet(CACHE_KEY, result, TTL.GOLD_PRICE)
    return result
  } catch (error) {
    console.error('Gold price API error:', error)

    const fallback: GoldPrice = {
      symbol: 'XAU/USD',
      price: 2650.00,
      change24h: 0.75,
      currency: 'USD',
      unit: 'oz',
      timestamp: new Date().toISOString()
    }
    cacheSet(CACHE_KEY, fallback, 3_600_000)
    return fallback
  }
})

interface GoldPrice {
  symbol: string
  price: number
  change24h: number
  currency: string
  unit: string
  timestamp: string
}
