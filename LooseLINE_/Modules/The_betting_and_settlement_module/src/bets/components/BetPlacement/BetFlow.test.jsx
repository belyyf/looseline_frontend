import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BetsPage from '../../pages/BetsPage.jsx'
import * as betService from '../../services/betService'

describe('Bet placement flow (UI)', () => {
  it('shows potential win when coefficient and amount selected', () => {
    render(<BetsPage />)

    // выбираем первое событие
    const firstEvent = screen.getByText(/Man Utd vs Liverpool/i)
    fireEvent.click(firstEvent)

    // выбираем исход П1
    const homeButton = screen.getByTestId('outcome-HOME')
    fireEvent.click(homeButton)

    // вводим сумму
    const amountInput = screen.getByPlaceholderText(/Введите сумму/i)
    fireEvent.change(amountInput, { target: { value: '100' } })

    // проверяем расчёт
    expect(screen.getByTestId('payout-display').textContent).toContain('185.00')
    expect(screen.getByTestId('profit-display').textContent).toContain('85.00')
  })

  it('opens confirmation modal and calls placeBet on submit', async () => {
    const placeBetSpy = vi.spyOn(betService, 'placeBet').mockResolvedValue({ betId: 'TESTBET1' })

    render(<BetsPage />)

    const firstEvent = screen.getByText(/Man Utd vs Liverpool/i)
    fireEvent.click(firstEvent)

    const homeButton = screen.getByTestId('outcome-HOME')
    fireEvent.click(homeButton)

    const amountInput = screen.getByPlaceholderText(/Введите сумму/i)
    fireEvent.change(amountInput, { target: { value: '100' } })

    const submitButton = screen.getByTestId('bet-submit-button')
    fireEvent.click(submitButton)

    // модалка подтверждения
    await screen.findByTestId('bet-confirmation-modal')

    const confirmButton = screen.getByTestId('confirm-bet-button')
    fireEvent.click(confirmButton)

    expect(placeBetSpy).toHaveBeenCalledTimes(1)

    placeBetSpy.mockRestore()
  })
})


