// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Users, CreditCard, Activity, DollarSign, Plus } from 'lucide-react';
import { EventsChart } from '@/app/components/EventsChart';
import { AddEventModal } from '@/app/components/AddEventModal';

type StatCardProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value?: string;
  trend?: string;
};

const StatCard = ({ title, icon: Icon, value = "—", trend }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {trend || "Данные загружаются..."}
      </p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
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
          const formattedEvents = data.map((event: any, index: number) => {
            // Формируем название события
            let eventName = '';
            if (event.home_team && event.away_team) {
              eventName = `${event.home_team} vs ${event.away_team}`;
            } else if (event.title) {
              eventName = event.title;
            } else if (event.name) {
              eventName = event.name;
            } else {
              eventName = `Событие #${event.id || event.event_id || index + 1}`;
            }
            
            // Форматируем дату
            let eventDate = '';
            if (event.event_datetime) {
              const dt = new Date(event.event_datetime);
              eventDate = dt.toLocaleDateString('ru-RU') + ' ' + dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            } else if (event.date) {
              eventDate = event.date;
            } else {
              eventDate = new Date().toISOString().split('T')[0];
            }
            
            return {
              id: event.id || event.event_id || index + 1,
              name: eventName,
              date: eventDate,
              rawDate: event.event_datetime || event.date,
              type: event.sport || event.type || 'Match',
              home_team: event.home_team,
              away_team: event.away_team,
              status: event.status,
              league_name: event.league_name,
              expectedRevenue: event.expectedRevenue || Math.floor(Math.random() * 100000) + 10000
            };
          });
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

  const stats = [
    { title: 'Доход', icon: DollarSign, value: '$45,231.89', trend: '+20% с прошлого месяца' },
    { title: 'Активных событий', icon: CreditCard, value: loading ? '...' : events.length.toString(), trend: 'Всего запланировано' },
  ];

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
          { bet_type: '1', coefficient: parseFloat(newEvent.coefficient_1) || 2.0 },
          { bet_type: 'X', coefficient: parseFloat(newEvent.coefficient_x) || 3.0 },
          { bet_type: '2', coefficient: parseFloat(newEvent.coefficient_2) || 2.5 }
        ],
        admin_id: 'admin_1' // В реальном приложении брать из сессии
      };

      console.log('📤 Отправка события:', eventData);

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
        const eventName = `${newEvent.home_team || createdEvent.event?.home_team} vs ${newEvent.away_team || createdEvent.event?.away_team}`;
        
        // Показываем сообщение об успехе
        alert(`✅ Событие "${eventName}" успешно создано!\n\nКоэффициенты:\nП1: ${newEvent.coefficient_1 || 2.0}\nX: ${newEvent.coefficient_x || 3.0}\nП2: ${newEvent.coefficient_2 || 2.5}`);
        
        setIsModalOpen(false);
        // Перезагружаем список событий
        const refreshResponse = await fetch('/api/events');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const formattedEvents = data.map((event: any, index: number) => {
            // Формируем название события
            let eventName = '';
            if (event.home_team && event.away_team) {
              eventName = `${event.home_team} vs ${event.away_team}`;
            } else if (event.title) {
              eventName = event.title;
            } else if (event.name) {
              eventName = event.name;
            } else {
              eventName = `Событие #${event.id || event.event_id || index + 1}`;
            }
            
            // Форматируем дату
            let eventDate = '';
            if (event.event_datetime) {
              const dt = new Date(event.event_datetime);
              eventDate = dt.toLocaleDateString('ru-RU') + ' ' + dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            } else if (event.date) {
              eventDate = event.date;
            } else {
              eventDate = new Date().toISOString().split('T')[0];
            }
            
            return {
              id: event.id || event.event_id || index + 1,
              name: eventName,
              date: eventDate,
              rawDate: event.event_datetime || event.date,
              type: event.sport || event.type || 'Match',
              home_team: event.home_team,
              away_team: event.away_team,
              status: event.status,
              league_name: event.league_name,
              expectedRevenue: event.expectedRevenue || Math.floor(Math.random() * 100000) + 10000
            };
          });
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
    <div className="p-8 space-y-8">
      {/* Большая заметная кнопка вверху */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Создать новое событие</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Добавьте матч с командами и коэффициентами для ставок</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg text-base font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 h-12 px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
          >
            <Plus className="h-6 w-6" /> 
            <span>+ Добавить событие</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
          <p className="text-muted-foreground mt-1">Управление событиями и статистикой</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-11 px-6 py-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          style={{ minWidth: '180px' }}
        >
          <Plus className="h-5 w-5" /> 
          <span>Добавить событие</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            icon={stat.icon}
            value={stat.value}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Обзор доходов по событиям</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Загрузка данных...
              </div>
            ) : error ? (
              <div className="h-[300px] flex items-center justify-center text-destructive">
                {error}
              </div>
            ) : (
              <EventsChart data={events} />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>События</CardTitle>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 shadow-sm hover:shadow"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Добавить
            </button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Загрузка...</div>
            ) : error ? (
              <div className="text-center text-destructive py-8">{error}</div>
            ) : events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 space-y-3">
                <p>Нет событий. Создайте первое событие!</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 shadow-md hover:shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" /> Создать событие
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.slice().reverse().slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.type} • {event.date}</p>
                    </div>
                    <div className="ml-auto font-medium">+${event.expectedRevenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
}