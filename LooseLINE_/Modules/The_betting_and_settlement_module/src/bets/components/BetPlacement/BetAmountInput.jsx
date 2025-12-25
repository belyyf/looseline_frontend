import { useBetSlip } from '../../hooks/useBetSlip.js'

export default function BetAmountInput() {
  const { selection, setSelection } = useBetSlip()

  return (
    <div>
      <div className="field-label">Сумма ставки</div>
      <input
        type="number"
        min={0}
        step={10}
        value={selection.amount || ''}
        onChange={(e) =>
          setSelection((prev) => ({
            ...prev,
            amount: Number(e.target.value),
          }))
        }
        className="text-input"
        placeholder="Введите сумму, например 100"
      />
    </div>
  )
}