import { useEffect, useState } from "react";

type Event = {
  event_id: number;
  home_team: string;
  away_team: string;
  league: string;
  status: string;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data.events));
  }, []);

  return (
    <div style={{ padding: "var(--space-20)" }}>
      <h1 className="h1">📅 События</h1>

      <div className="events-grid">
        {events.map((e) => (
          <div key={e.event_id} className="event-card">
            <div className="teams">
              <b>{e.home_team}</b> vs <b>{e.away_team}</b>
            </div>
            <div className="league">Лига: {e.league}</div>
            <div className={`status ${e.status.toLowerCase()}`}>
              Статус: {e.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
