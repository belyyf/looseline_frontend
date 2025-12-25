import { BetSlipProvider } from '../context/BetSlipContext.jsx'
import { useBetSlip } from '../hooks/useBetSlip.js'
import BetAmountInput from '../components/BetPlacement/BetAmountInput.jsx'
import BetTypeSelector from '../components/BetPlacement/BetTypeSelector.jsx'
import PotentialWinDisplay from '../components/BetPlacement/PotentialWinDisplay.jsx'
import BetSubmitButton from '../components/BetPlacement/BetSubmitButton.jsx'
import BetConfirmationModal from '../components/BetConfirmation/BetConfirmationModal.jsx'
import SuccessModal from '../components/BetConfirmation/SuccessModal.jsx'

const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Man Utd vs Liverpool',
    date: '15.12 18:00',
    coefficients: {
      HOME: 1.85,
      DRAW: 3.4,
      AWAY: 2.2,
    },
  },
  {
    id: '2',
    name: 'Real Madrid vs Barcelona',
    date: '15.12 19:45',
    coefficients: {
      HOME: 2.1,
      DRAW: 3.3,
      AWAY: 2.6,
    },
  },
]

// оставь импорты как есть, меняем JSX внутри компонента BetsLayout

function BetsLayout() {
  const { selection, setSelection } = useBetSlip()

  const handleSelectEvent = (event) => {
    setSelection((prev) => ({
      ...prev,
      eventId: event.id,
      eventName: event.name,
      coefficient: null,
      outcome: null,
    }))
  }

  const activeEvent =
    selection.eventId && MOCK_EVENTS.find((e) => e.id === selection.eventId)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
    window.location.href = '/login';
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <div style={{
        background: '#1f2937',
        color: 'white',
        padding: '16px 32px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>LOOSELINE BETTING</div>
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Выйти
        </button>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gap: 32,
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)',
          padding: '0 20px'
        }}
      >
        {/* Список событий */}
        <div>
          <h1 style={{ marginBottom: 16 }}>Размещение ставок</h1>
          <p style={{ marginBottom: 20, color: 'var(--color-text-secondary)', maxWidth: 520 }}>
            Выберите событие, исход (П1, Х, П2), введите сумму и посмотрите потенциальный
            выигрыш в реальном времени.
          </p>

          <div className="card card--muted">
            <div style={{ fontSize: 12, marginBottom: 12, color: 'var(--color-text-tertiary)' }}>
              от Петра (mock)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_EVENTS.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => handleSelectEvent(event)}
                  className={
                    'event-card ' +
                    (selection.eventId === event.id ? 'event-card--active' : '')
                  }
                >
                  <div className="event-card__title">{event.name}</div>
                  <div className="event-card__meta">{event.date}</div>
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      gap: 16,
                      fontSize: 13,
                    }}
                  >
                    <span>П1: {event.coefficients.HOME.toFixed(2)}</span>
                    <span>Х: {event.coefficients.DRAW.toFixed(2)}</span>
                    <span>П2: {event.coefficients.AWAY.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Купон */}
        <div style={{ alignSelf: 'stretch' }}>
          <div className="card">
            <h2 style={{ fontSize: 20, marginBottom: 8, color: '#111827' }}>Мой купон</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 16 }}>
              {selection.eventName
                ? selection.eventName
                : 'Сначала выберите событие из списка слева.'}
            </p>

            <BetTypeSelector
              coefficientMap={activeEvent ? activeEvent.coefficients : undefined}
            />
            <div style={{ marginTop: 16 }}>
              <BetAmountInput />
            </div>
            <PotentialWinDisplay />
            <BetSubmitButton />
          </div>
        </div>
      </div>

      <BetConfirmationModal />
      <SuccessModal />
    </div>
  )
}

export default function BetsPage() {
  return (
    <BetSlipProvider>
      <BetsLayout />
    </BetSlipProvider>
  )
}