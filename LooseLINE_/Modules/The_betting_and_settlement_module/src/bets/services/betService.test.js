import { describe, it, expect, vi } from 'vitest'
import {
  calculatePotentialWin,
  placeBet,
  calculatePotentialWinCoupon,
  createCoupon,
  updateBetStatus,
} from './betService'

describe('calculatePotentialWin', () => {
  it('correctly calculates payout and profit for valid input', () => {
    const { payout, profit } = calculatePotentialWin(100, 1.85)
    expect(payout).toBe(185)
    expect(profit).toBe(85)
  })

  it('returns zeros for non‑positive values', () => {
    const res1 = calculatePotentialWin(0, 1.85)
    const res2 = calculatePotentialWin(100, 0)
    expect(res1).toEqual({ payout: 0, profit: 0 })
    expect(res2).toEqual({ payout: 0, profit: 0 })
  })

  it('is resilient to NaN / invalid numbers', () => {
    const { payout, profit } = calculatePotentialWin(NaN, Number.POSITIVE_INFINITY)
    expect(payout).toBe(0)
    expect(profit).toBe(0)
  })
})

describe('placeBet', () => {
  it('returns bet id and calls internal timeout', async () => {
    const payload = { eventId: '1', outcome: 'HOME', coefficient: 1.85, amount: 100 }

    const timeoutSpy = vi.spyOn(global, 'setTimeout')

    const result = await placeBet(payload)

    expect(typeof result.betId).toBe('string')
    expect(result.betId.length).toBeGreaterThan(0)
    expect(timeoutSpy).toHaveBeenCalled()

    timeoutSpy.mockRestore()
  })
})

describe('calculatePotentialWinCoupon', () => {
  it('correctly calculates coupon win for 3 bets', () => {
    const result = calculatePotentialWinCoupon(150, [1.85, 2.1, 3.4])
    // totalCoefficient = 1.85 * 2.1 * 3.4 = 13.209
    // potentialWin = 150 * 13.209 = 1981.35
    // profit = 1981.35 - 150 = 1831.35
    expect(result.totalCoefficient).toBeCloseTo(13.21, 2)
    expect(result.potentialWin).toBeCloseTo(1981.35, 2)
    expect(result.profit).toBeCloseTo(1831.35, 2)
    expect(result.betAmount).toBe(150)
    expect(result.coefficients).toEqual([1.85, 2.1, 3.4])
  })

  it('returns zeros for empty coefficients array', () => {
    const result = calculatePotentialWinCoupon(100, [])
    expect(result).toEqual({
      betAmount: 0,
      coefficients: [],
      totalCoefficient: 0,
      potentialWin: 0,
      profit: 0,
    })
  })

  it('filters out invalid coefficients (< 1.01)', () => {
    const result = calculatePotentialWinCoupon(100, [1.85, 0.5, 2.1, -1, 3.4])
    // Должны остаться только 1.85, 2.1, 3.4
    expect(result.coefficients).toEqual([1.85, 2.1, 3.4])
    expect(result.totalCoefficient).toBeCloseTo(13.21, 2)
  })

  it('handles single coefficient in coupon', () => {
    const result = calculatePotentialWinCoupon(100, [1.85])
    expect(result.totalCoefficient).toBe(1.85)
    expect(result.potentialWin).toBe(185)
    expect(result.profit).toBe(85)
  })
})

describe('createCoupon', () => {
  it('creates coupon with valid betIds and amount', async () => {
    const betIds = ['bet1', 'bet2', 'bet3']
    const totalAmount = 150

    const result = await createCoupon(betIds, totalAmount)

    expect(result.couponId).toBeDefined()
    expect(typeof result.couponId).toBe('string')
    expect(result.couponCode).toMatch(/^CPN\d{8}_[A-Z0-9]+$/)
    expect(result.totalBetAmount).toBe(150)
    expect(result.numberOfBets).toBe(3)
  })

  it('throws error for empty betIds array', async () => {
    await expect(createCoupon([], 100)).rejects.toThrow('betIds must be a non-empty array')
  })

  it('throws error for invalid totalAmount', async () => {
    await expect(createCoupon(['bet1'], 0)).rejects.toThrow('totalAmount must be a positive number')
    await expect(createCoupon(['bet1'], -10)).rejects.toThrow('totalAmount must be a positive number')
  })

  it('generates unique coupon codes', async () => {
    const betIds = ['bet1']
    const code1 = (await createCoupon(betIds, 100)).couponCode
    const code2 = (await createCoupon(betIds, 100)).couponCode
    expect(code1).not.toBe(code2)
  })
})

describe('updateBetStatus', () => {
  it('updates bet status to cancelled', async () => {
    const result = await updateBetStatus('bet123', 'cancelled', 'Пользователь передумал')

    expect(result.success).toBe(true)
    expect(result.betId).toBe('bet123')
    expect(result.status).toBe('cancelled')
    expect(result.refundAmount).toBeNull() // В mock не знаем сумму, на backend будет заполнено
    expect(result.transactionType).toBe('bet_cancelled')
  })

  it('updates bet status to open (reopen)', async () => {
    const result = await updateBetStatus('bet123', 'open', 'Ставка открыта заново')

    expect(result.success).toBe(true)
    expect(result.status).toBe('open')
    expect(result.refundAmount).toBeUndefined()
  })

  it('throws error for invalid status', async () => {
    await expect(updateBetStatus('bet123', 'invalid_status')).rejects.toThrow(
      'newStatus must be one of: open, cancelled, resolved',
    )
  })

  it('throws error for missing betId', async () => {
    await expect(updateBetStatus(null, 'cancelled')).rejects.toThrow('betId is required')
  })

  it('works without reason parameter', async () => {
    const result = await updateBetStatus('bet123', 'resolved')
    expect(result.success).toBe(true)
    expect(result.message).toContain('resolved')
  })
})

