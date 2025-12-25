import { useState } from 'react'
import { useBetSlip } from '../../hooks/useBetSlip.js'

export default function BetSubmitButton() {
  const { selection, setIsConfirmOpen } = useBetSlip()
  const [hint, setHint] = useState('')

  const handleClick = () => {
    if (!selection.eventId) return setHint('Выберите событие')
    if (!selection.outcome || !selection.coefficient) return setHint('Выберите исход')
    if (!selection.amount || selection.amount <= 0) return setHint('Введите сумму ставки')

    setHint('')
    setIsConfirmOpen(true)
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        className="btn-primary"
        data-testid="bet-submit-button"
        onClick={handleClick}
        style={{ width: '100%' }}
      >
        Подтвердить ставку
      </button>
      {hint && (
        <div
          data-testid="bet-submit-hint"
          style={{ marginTop: 4, fontSize: 12, color: '#e74c3c' }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}