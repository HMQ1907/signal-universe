/**
 * AI confirm window (local time, same as legacy server helpers).
 * - Production: 00:00 through end of hour 14 (inclusive, i.e. through 14:59:59).
 * - TEST_AI: 00:00 through 22:50:59 (inclusive minute 22:50).
 */

export const AI_TEST_WINDOW_END_HOUR = 22
export const AI_TEST_WINDOW_END_MINUTE = 50

export function isAiConfirmWindowOpenAt(now: Date, testAi: boolean): boolean {
  if (testAi) {
    const total = now.getHours() * 60 + now.getMinutes()
    const end = AI_TEST_WINDOW_END_HOUR * 60 + AI_TEST_WINDOW_END_MINUTE
    return total >= 0 && total <= end
  }
  const h = now.getHours()
  return h >= 0 && h <= 14
}

/** End instant for countdown within the current calendar day (same day as `now`). */
export function getAiConfirmWindowEndDate(now: Date, testAi: boolean): Date {
  const end = new Date(now)
  if (testAi) {
    end.setHours(AI_TEST_WINDOW_END_HOUR, AI_TEST_WINDOW_END_MINUTE, 59, 999)
    return end
  }
  end.setHours(14, 59, 59, 999)
  return end
}
