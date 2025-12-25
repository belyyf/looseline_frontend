import { useEffect, useState } from "react";
import { loadEvents } from "../services/eventService";
import { BetSlipProvider } from "../context/BetSlipContext";
import { useBetSlip } from "../hooks/useBetSlip";
import BetSlipPanel from "../components/BetSlipPanel";
import BetConfirmationModal from "../components/BetConfirmationModal";
import SuccessModal from "../components/SuccessModal";

type Event = {
  id: number;
  sport: "football" | "basketball" | "hockey";
  title: string;
  datetime: string;
  odds: {
    HOME: number;
    DRAW: number;
    AWAY: number;
  };
};

const sportIcons: Record<string, string> = {
  football: "⚽",
  basketball: "🏀",
  hockey: "🏒",
};

// Функция для генерации случайной даты и времени
function generateRandomDateTime(index: number): string {
  const now = new Date();

  const baseDaysOffset = index % 7;
  const randomOffset = Math.floor(Math.random() * 2);
  const daysOffset = baseDaysOffset + randomOffset;

  const eventDate = new Date(now);
  eventDate.setDate(now.getDate() + daysOffset);

  const timeSlots = [10, 12, 14, 16, 18, 20, 22];
  const hours = timeSlots[index % timeSlots.length] + Math.floor(Math.random() * 2);
  const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

  eventDate.setHours(hours, minutes, 0);

  const day = String(eventDate.getDate()).padStart(2, '0');
  const month = String(eventDate.getMonth() + 1).padStart(2, '0');
  const year = eventDate.getFullYear();
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');

  return `${day}.${month}.${year} ${hoursStr}:${minutesStr}`;
}

function EventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<"all" | "football" | "basketball" | "hockey">("all");
  const { selection, setSelection } = useBetSlip();

  useEffect(() => {
    loadEvents().then((data) => {
      const prepared: Event[] = data
        .filter((e: any) => e.home_team && e.away_team) // Только события с командами
        .map((e: any, index: number) => {
          // Форматируем дату из event_datetime
          let formattedDate = generateRandomDateTime(index);
          if (e.event_datetime) {
            try {
              const dt = new Date(e.event_datetime);
              const day = String(dt.getDate()).padStart(2, '0');
              const month = String(dt.getMonth() + 1).padStart(2, '0');
              const year = dt.getFullYear();
              const hours = String(dt.getHours()).padStart(2, '0');
              const minutes = String(dt.getMinutes()).padStart(2, '0');
              formattedDate = `${day}.${month}.${year} ${hours}:${minutes}`;
            } catch {
              // Используем сгенерированную дату если ошибка
            }
          }

          // Используем реальные коэффициенты из API или значения по умолчанию
          const odds = e.odds || {
            HOME: 2.0,
            DRAW: 3.0,
            AWAY: 2.5,
          };

          return {
            id: e.id || e.event_id,
            sport: e.sport || 'football',
            title: e.title || `${e.home_team} vs ${e.away_team}`,
            datetime: formattedDate,
            odds: {
              HOME: odds.HOME || odds['1'] || 2.0,
              DRAW: odds.DRAW || odds['X'] || 3.0,
              AWAY: odds.AWAY || odds['2'] || 2.5,
            },
          };
        });
      setEvents(prepared);
    });
  }, []);

  const filtered =
    filter === "all"
      ? events
      : events.filter((e) => e.sport === filter);

  function selectEvent(event: Event, outcome: "HOME" | "DRAW" | "AWAY") {
    const coefficient = event.odds[outcome];

    // Если тот же исход на том же событии - снимаем выбор
    if (selection.eventId === event.id && selection.outcome === outcome) {
      setSelection((prev) => ({
        ...prev,
        eventId: null,
        eventName: null,
        eventDate: null,
        outcome: null,
        coefficient: null,
        coefficients: null,
      }));
    } else {
      // Выбираем новое событие и исход
      setSelection((prev) => ({
        ...prev,
        eventId: event.id,
        eventName: event.title,
        eventDate: event.datetime,
        outcome: outcome,
        coefficient: coefficient,
        coefficients: event.odds,
      }));
    }
  }

  return (
    <div className="layout">
      {/* ЛЕВАЯ ЧАСТЬ */}
      <div className="events">
        <h2 className="h2">События</h2>

        <div style={{ display: "flex", gap: "var(--space-12)", marginBottom: "var(--space-20)" }}>
          <button
            className={filter === "all" ? "btn-primary" : "btn-secondary"}
            onClick={() => setFilter("all")}
          >
            Все
          </button>
          <button
            className={filter === "football" ? "btn-primary" : "btn-secondary"}
            onClick={() => setFilter("football")}
          >
            ⚽ Футбол
          </button>
          <button
            className={filter === "basketball" ? "btn-primary" : "btn-secondary"}
            onClick={() => setFilter("basketball")}
          >
            🏀 Баскетбол
          </button>
          <button
            className={filter === "hockey" ? "btn-primary" : "btn-secondary"}
            onClick={() => setFilter("hockey")}
          >
            🏒 Хоккей
          </button>
        </div>

        {filtered.map((event) => {
          const isSelected = selection.eventId === event.id;

          return (
            <div key={event.id} className={`event-card ${isSelected ? 'event-card--selected' : ''}`}>
              <div className="event-header">
                <span className="sport-icon">{sportIcons[event.sport]}</span>
                <span className="teams">{event.title}</span>
              </div>

              <div className="caption" style={{ marginBottom: "var(--space-12)" }}>
                📅 {event.datetime}
              </div>

              <div className="odds-row">
                {(["HOME", "DRAW", "AWAY"] as const).map((outcomeType) => {
                  const coef = event.odds[outcomeType];
                  const label = outcomeType === "HOME" ? "П1" : outcomeType === "DRAW" ? "Х" : "П2";
                  const active = isSelected && selection.outcome === outcomeType;

                  return (
                    <button
                      key={outcomeType}
                      onClick={() => selectEvent(event, outcomeType)}
                      className="odd-button"
                      style={{
                        border: active
                          ? `2px solid var(--color-primary)`
                          : `1px solid var(--color-border-default)`,
                        background: active ? "var(--color-success-bg)" : "var(--color-bg-secondary)",
                        color: active ? "var(--color-success)" : "var(--color-text-primary)",
                      }}
                    >
                      <span className="caption">{label}</span>
                      <span className="coefficient">{coef.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ПАНЕЛЬ СТАВОК */}
      <div className="coupon">
        <BetSlipPanel />
      </div>

      {/* Модальные окна */}
      <BetConfirmationModal />
      <SuccessModal />
    </div>
  );
}

export default function EventsMainPage() {
  return (
    <BetSlipProvider>
      <EventsContent />
    </BetSlipProvider>
  );
}
