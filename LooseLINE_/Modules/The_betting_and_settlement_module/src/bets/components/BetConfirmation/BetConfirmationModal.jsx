import { useState } from 'react'
import { useBetSlip } from '../../hooks/useBetSlip'
import { placeBet } from '../../services/betService'

export default function BetConfirmationModal() {
  const {
    selection,
    isConfirmOpen,
    setIsConfirmOpen,
    setLastBetResult,
    resetSelection,
    potential,
  } = useBetSlip()
  const [loading, setLoading] = useState(false)

  if (!isConfirmOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const { betId } = await placeBet({
        eventId: selection.eventId,
        outcome: selection.outcome,
        coefficient: selection.coefficient,
        amount: selection.amount,
      })
      setLastBetResult({ status: 'success', betId })
      resetSelection()
    } finally {
      setLoading(false)
      setIsConfirmOpen(false)
    }
  }

  const outcomeLabel =
    selection.outcome === 'HOME'
      ? 'П1'
      : selection.outcome === 'DRAW'
      ? 'Х'
      : selection.outcome === 'AWAY'
      ? 'П2'
      : '—'

  return (
    <div
      className="modal-backdrop"
      aria-modal="true"
      role="dialog"
      data-testid="bet-confirmation-modal"
    >
      <div className="modal" style={{ animation: 'fadeIn var(--duration-normal) var(--ease-standard)' }}>
        <h2 className="modal__title">Подтвердите ставку</h2>
        <p className="modal__body" style={{ marginBottom: 'var(--space-16)' }}>
          {selection.eventName || 'Неизвестное событие'} • {outcomeLabel} • k ={' '}
          {selection.coefficient?.toFixed(2) ?? '—'}
        </p>

        <div
          style={{
            padding: 'var(--space-16)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-light)',
            backgroundColor: 'rgba(0,0,0,0.15)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-16)',
          }}
        >
          <div className="potential-win__row">
            <span>Сумма</span>
            <span>{selection.amount ? `${selection.amount.toFixed(2)} $` : '—'}</span>
          </div>
          <div className="potential-win__row">
            <span>Выплата</span>
            <span>{potential.payout ? `${potential.payout.toFixed(2)} $` : '—'}</span>
          </div>
          <div className="potential-win__row">
            <span>Прибыль</span>
            <span>{potential.profit ? `${potential.profit.toFixed(2)} $` : '—'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-12)' }}>
          <button
            type="button"
            onClick={() => setIsConfirmOpen(false)}
            style={{
              padding: 'var(--space-8) var(--space-16)',
              borderRadius: 'var(--radius-base)',
              border: `1px solid var(--color-border-dark)`,
              color: '#ecf0f1',
              backgroundColor: 'transparent',
            }}
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="btn-primary"
            data-testid="confirm-bet-button"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Отправка…' : 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  )
}


