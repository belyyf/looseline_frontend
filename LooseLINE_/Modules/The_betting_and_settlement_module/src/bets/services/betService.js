// Simple bet service stub based on design from interfeys.pdf (file://interfeys.pdf)
// In a real app this would call backend endpoints.

/**
 * Calculate potential win on the frontend.
 * Backend version can refine logic later.
 * @param {number} amount
 * @param {number} coefficient
 * @returns {{payout: number, profit: number}}
 */
export function calculatePotentialWin(amount, coefficient) {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const safeCoeff = Number.isFinite(coefficient) ? coefficient : 0

  const payout = +(safeAmount * safeCoeff).toFixed(2)
  const profit = +(payout - safeAmount).toFixed(2)

  return {
    payout: payout > 0 ? payout : 0,
    profit: profit > 0 ? profit : 0,
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Place bet via backend API.
 * @param {{eventId: string, outcome: string, coefficient: number, amount: number, eventName: string}} payload
 * @returns {Promise<{betId: string}>}
 */
export async function placeBet(payload) {
  // Получаем данные о событии из Sports API для заполнения event_name и event_end_date
  let eventDetails = null
  try {
    const eventsApiUrl = import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:8001'
    const eventsRes = await fetch(`${eventsApiUrl}/events`)
    if (eventsRes.ok) {
      const allEvents = await eventsRes.json()
      eventDetails = allEvents.find(e => String(e.id) === String(payload.eventId) || String(e.event_id) === String(payload.eventId))
    }
  } catch (e) {
    console.warn('Could not fetch event details:', e)
  }

  const body = {
    user_id: 'user_123', // TODO: заменить на реального пользователя, когда будет auth
    event_id: Number(payload.eventId),
    odds_id: Number(payload.oddsId || 1),
    bet_type: payload.outcome === 'HOME' ? '1' : payload.outcome === 'DRAW' ? 'X' : '2',
    bet_amount: payload.amount,
    coefficient: payload.coefficient,
    event_name: eventDetails?.title || payload.eventName || `Событие #${payload.eventId}`,
    event_end_date: eventDetails?.event_datetime || eventDetails?.date || null,
  }

  const res = await fetch(`${API_URL}/bets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error('Failed to place bet', await res.text())
    throw new Error('Не удалось разместить ставку')
  }

  const data = await res.json()
  return { betId: String(data.bet_id) }
}

/**
 * Calculate potential win for a coupon (express bet).
 * Total coefficient is the product of all individual coefficients.
 * @param {number} amount - Total bet amount for the coupon
 * @param {number[]} coefficients - Array of coefficients for each bet in the coupon
 * @returns {{betAmount: number, coefficients: number[], totalCoefficient: number, potentialWin: number, profit: number}}
 */
export function calculatePotentialWinCoupon(amount, coefficients) {
  if (!Array.isArray(coefficients) || coefficients.length === 0) {
    return {
      betAmount: 0,
      coefficients: [],
      totalCoefficient: 0,
      potentialWin: 0,
      profit: 0,
    }
  }

  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0
  const validCoeffs = coefficients
    .map((c) => (Number.isFinite(c) && c >= 1.01 ? c : null))
    .filter((c) => c !== null)

  if (validCoeffs.length === 0 || safeAmount === 0) {
    return {
      betAmount: safeAmount,
      coefficients: validCoeffs,
      totalCoefficient: 0,
      potentialWin: 0,
      profit: 0,
    }
  }

  // Общий коэффициент = произведение всех коэффициентов
  const totalCoefficient = validCoeffs.reduce((acc, coeff) => acc * coeff, 1)
  const potentialWin = +(safeAmount * totalCoefficient).toFixed(2)
  const profit = +(potentialWin - safeAmount).toFixed(2)

  return {
    betAmount: safeAmount,
    coefficients: validCoeffs,
    totalCoefficient: +totalCoefficient.toFixed(2),
    potentialWin: potentialWin > 0 ? potentialWin : 0,
    profit: profit > 0 ? profit : 0,
  }
}

/**
 * Create a coupon (express bet) from multiple bet IDs.
 * In a real app, this would call backend API POST /api/coupons/create
 * @param {string[]} betIds - Array of bet IDs to include in the coupon
 * @param {number} totalAmount - Total amount to bet on the coupon
 * @returns {Promise<{couponId: string, couponCode: string, totalBetAmount: number, totalPotentialWin: number, numberOfBets: number}>}
 */
export async function createCoupon(betIds, totalAmount) {
  console.log('[betService] creating coupon', { betIds, totalAmount })

  if (!Array.isArray(betIds) || betIds.length === 0) {
    throw new Error('betIds must be a non-empty array')
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('totalAmount must be a positive number')
  }

  // Имитация сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Генерация кода купона (например, CPN20251215_ABC123)
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomCode = Math.random().toString(36).slice(2, 8).toUpperCase()
  const couponCode = `CPN${date}_${randomCode}`

  return {
    couponId: Math.random().toString(36).slice(2, 10).toUpperCase(),
    couponCode,
    totalBetAmount: totalAmount,
    totalPotentialWin: 0, // Будет рассчитан на backend на основе коэффициентов всех ставок
    numberOfBets: betIds.length,
  }
}

/**
 * Update bet status (cancel, reopen, etc.).
 * In a real app, this would call backend API PATCH /api/bets/:betId/status
 * @param {string|number} betId - ID of the bet to update
 * @param {string} newStatus - New status: 'cancelled', 'open', 'resolved'
 * @param {string} [reason] - Optional reason for the status change
 * @returns {Promise<{success: boolean, betId: string|number, status: string, refundAmount?: number}>}
 */
export async function updateBetStatus(betId, newStatus, reason) {
  console.log('[betService] updating bet status', { betId, newStatus, reason })

  if (!betId) {
    throw new Error('betId is required')
  }

  const validStatuses = ['open', 'cancelled', 'resolved']
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`newStatus must be one of: ${validStatuses.join(', ')}`)
  }

  // Имитация сетевого запроса
  await new Promise((resolve) => setTimeout(resolve, 300))

  const result = {
    success: true,
    betId,
    status: newStatus,
    message: reason || `Bet status updated to ${newStatus}`,
  }

  // Если ставка отменена, возвращаем информацию о возврате денег
  if (newStatus === 'cancelled') {
    // В реальном приложении здесь будет запрос к backend для получения суммы ставки
    // Для mock просто возвращаем заглушку
    result.refundAmount = null // Будет заполнено на backend
    result.transactionType = 'bet_cancelled'
  }

  return result
}


