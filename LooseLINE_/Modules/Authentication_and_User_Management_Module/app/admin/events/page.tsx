// app/admin/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Plus, Calendar, Users, Trophy } from 'lucide-react';
import { AddEventModal } from '@/app/components/AddEventModal';

export default function EventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          // Преобразуем данные из API в формат для компонента
          const formattedEvents = data.map((event: any, index: number) => ({
            id: event.id || event.event_id || index + 1,
            name: event.title || event.name || `${event.home_team || ''} vs ${event.away_team || ''}` || `Событие #${index + 1}`,
            date: event.event_datetime || event.date || new Date().toISOString().split('T')[0],
            type: event.sport || event.type || 'Match',
            home_team: event.home_team,
            away_team: event.away_team,
            sport: event.sport,
            status: event.status || 'scheduled',
            expectedRevenue: event.expectedRevenue || Math.floor(Math.random() * 100000) + 10000
          }));
          setEvents(formattedEvents);
        } else {
          setError('Не удалось загрузить события');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Ошибка при загрузке событий');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleAddEvent = async (newEvent: any) => {
    try {
      // Преобразуем datetime-local в ISO формат
      let eventDateTime = newEvent.event_datetime || newEvent.date;
      if (eventDateTime && !eventDateTime.includes('T')) {
        // Если это только дата, добавляем время
        eventDateTime = `${eventDateTime}T12:00:00`;
      }
      // Преобразуем в ISO формат с Z
      if (eventDateTime && !eventDateTime.endsWith('Z')) {
        eventDateTime = new Date(eventDateTime).toISOString();
      }

      // Преобразуем данные из формы в формат API
      const eventData = {
        sport_type: newEvent.sport_type || 'football',
        league_name: newEvent.league_name || 'Premier League',
        home_team: newEvent.home_team || newEvent.name?.split(' vs ')[0] || 'Team A',
        away_team: newEvent.away_team || newEvent.name?.split(' vs ')[1] || 'Team B',
        event_datetime: eventDateTime,
        odds_data: [
          { bet_type: '1', coefficient: newEvent.coefficient_1 || 2.0 },
          { bet_type: 'X', coefficient: newEvent.coefficient_x || 3.0 },
          { bet_type: '2', coefficient: newEvent.coefficient_2 || 2.5 }
        ],
        admin_id: 'admin_1' // В реальном приложении брать из сессии
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const createdEvent = await response.json();
        // Обновляем список событий
        const formattedEvent = {
          id: createdEvent.event?.event_id || Date.now(),
          name: `${createdEvent.event?.home_team || newEvent.home_team} vs ${createdEvent.event?.away_team || newEvent.away_team}`,
          date: createdEvent.event?.event_datetime || newEvent.event_datetime || newEvent.date,
          type: createdEvent.event?.sport_type || newEvent.sport_type || newEvent.type,
          home_team: createdEvent.event?.home_team || newEvent.home_team,
          away_team: createdEvent.event?.away_team || newEvent.away_team,
          sport: createdEvent.event?.sport_type || newEvent.sport_type,
          status: createdEvent.event?.status || 'scheduled',
          expectedRevenue: newEvent.expectedRevenue || 50000
        };
        setEvents([...events, formattedEvent]);
        setIsModalOpen(false);
        // Перезагружаем список событий
        const refreshResponse = await fetch('/api/events');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const formattedEvents = data.map((event: any, index: number) => ({
            id: event.id || event.event_id || index + 1,
            name: event.title || event.name || `${event.home_team || ''} vs ${event.away_team || ''}` || `Событие #${index + 1}`,
            date: event.event_datetime || event.date || new Date().toISOString().split('T')[0],
            type: event.sport || event.type || 'Match',
            home_team: event.home_team,
            away_team: event.away_team,
            sport: event.sport,
            status: event.status || 'scheduled',
            expectedRevenue: event.expectedRevenue || Math.floor(Math.random() * 100000) + 10000
          }));
          setEvents(formattedEvents);
        }
      } else {
        let errorMessage = 'Неизвестная ошибка';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
        }
        alert(`Ошибка при создании события: ${errorMessage}\n\nПроверьте:\n- Что обе команды указаны и различаются\n- Что дата события в будущем\n- Что все поля заполнены`);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Ошибка при создании события');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">События</h1>
          <p className="text-muted-foreground mt-1">
            Управление спортивными событиями и матчами
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" /> Добавить событие
        </button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">Загрузка событий...</div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-destructive">{error}</div>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Нет событий</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте первое спортивное событие для начала работы
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Plus className="mr-2 h-4 w-4" /> Создать событие
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {event.name || `${event.home_team || 'Команда 1'} vs ${event.away_team || 'Команда 2'}`}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-800' 
                          : event.status === 'live'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status === 'scheduled' ? 'Запланировано' : event.status === 'live' ? 'В прямом эфире' : 'Завершено'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString('ru-RU', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span className="capitalize">{event.type || event.sport || 'Спорт'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Ожидаемый доход</div>
                    <div className="text-lg font-semibold">${event.expectedRevenue?.toLocaleString() || '0'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
}

