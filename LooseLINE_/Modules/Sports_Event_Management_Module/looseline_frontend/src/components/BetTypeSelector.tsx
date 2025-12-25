import { useBetSlip } from '../hooks/useBetSlip';
import type { Outcome } from '../context/BetSlipContext';

const OUTCOMES: { id: Outcome; label: string }[] = [
    { id: 'HOME', label: 'П1' },
    { id: 'DRAW', label: 'Х' },
    { id: 'AWAY', label: 'П2' },
];

export default function BetTypeSelector() {
    const { selection, setSelection } = useBetSlip();

    const coefficientMap = selection.coefficients;

    return (
        <div style={{ marginTop: 16 }}>
            <div className="field-label">Выберите исход</div>
            <div style={{ display: 'flex', gap: 8 }}>
                {OUTCOMES.map((o) => {
                    const coeff = coefficientMap?.[o.id as keyof typeof coefficientMap] ?? null;
                    const isActive = selection.outcome === o.id;
                    return (
                        <button
                            key={o.id}
                            type="button"
                            data-testid={`outcome-${o.id}`}
                            onClick={() =>
                                setSelection((prev) => ({
                                    ...prev,
                                    outcome: o.id,
                                    coefficient: coeff,
                                }))
                            }
                            disabled={!coeff}
                            className={
                                'outcome-button' +
                                (isActive ? ' outcome-button--active' : '') +
                                (!coeff ? ' outcome-button--disabled' : '')
                            }
                        >
                            <div className="outcome-button__label">{o.label}</div>
                            {coeff && (
                                <div className="outcome-button__coeff">k = {coeff.toFixed(2)}</div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
