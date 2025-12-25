import { useBetSlip } from '../../hooks/useBetSlip.js'

export default function PotentialWinDisplay() {
  const { selection, potential } = useBetSlip()

  return (
    <div className="potential-win">
      <div className="potential-win__row">
        <span>Коэффициент</span>
        <span data-testid="coeff-display">
          {selection.coefficient ? selection.coefficient.toFixed(2) : '—'}
        </span>
      </div>
      <div className="potential-win__row">
        <span>Сумма</span>
        <span data-testid="amount-display">
          {selection.amount ? `${selection.amount.toFixed(2)} $` : '—'}
        </span>
      </div>
      <div className="potential-win__row" style={{ marginTop: 8 }}>
        <span>Выплата</span>
        <span
          data-testid="payout-display"
          className="potential-win__value--main"
        >
          {potential.payout ? `${potential.payout.toFixed(2)} $` : '0 $'}
        </span>
      </div>
      <div className="potential-win__row" style={{ fontSize: 12 }}>
        <span>Прибыль</span>
        <span data-testid="profit-display">
          {potential.profit ? `${potential.profit.toFixed(2)} $` : '0 $'}
        </span>
      </div>
    </div>
  )
}