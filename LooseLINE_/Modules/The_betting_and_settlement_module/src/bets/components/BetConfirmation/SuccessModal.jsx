import { useEffect } from 'react'
import { useBetSlip } from '../../hooks/useBetSlip'

export default function SuccessModal() {
  const { lastBetResult, setLastBetResult } = useBetSlip()

  useEffect(() => {
    if (!lastBetResult) return
    const t = setTimeout(() => setLastBetResult(null), 5000)
    return () => clearTimeout(t)
  }, [lastBetResult, setLastBetResult])

  if (!lastBetResult) return null

  return (
    <div aria-live="polite" data-testid="success-modal" className="toast-success">
      <p style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 4 }}>Ставка принята!</p>
      {lastBetResult.betId && (
        <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
          Номер вашей ставки: {lastBetResult.betId}
        </p>
      )}
      <button
        type="button"
        onClick={() => setLastBetResult(null)}
        style={{
          fontSize: 'var(--font-size-xs)',
          textDecoration: 'underline',
          color: 'var(--color-text-secondary)',
          marginTop: 4,
        }}
      >
        Закрыть
      </button>
    </div>
  )
}


