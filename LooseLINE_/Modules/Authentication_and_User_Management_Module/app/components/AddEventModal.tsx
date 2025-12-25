'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: any) => void;
}

export function AddEventModal({ isOpen, onClose, onAddEvent }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    home_team: '',
    away_team: '',
    sport_type: 'football',
    league_name: 'Premier League',
    event_datetime: '',
    expectedRevenue: '',
    coefficient_1: '2.0', // П1 - победа домашней команды
    coefficient_x: '3.0', // X - ничья
    coefficient_2: '2.5', // П2 - победа гостевой команды
  });

  // Популярные лиги по видам спорта
  const leaguesBySport: Record<string, string[]> = {
    football: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Champions League', 'Europa League'],
    basketball: ['NBA', 'EuroLeague', 'VTB United League', 'ACB', 'LNB Pro A'],
    hockey: ['KHL', 'NHL', 'SHL', 'Liiga', 'Extraliga'],
    tennis: ['ATP Tour', 'WTA Tour', 'Grand Slam', 'ATP Masters 1000']
  };

  // Получаем список лиг для выбранного вида спорта
  const availableLeagues = leaguesBySport[formData.sport_type] || ['Premier League'];

  // Обновляем лигу при смене вида спорта
  const handleSportChange = (sport: string) => {
    const leagues = leaguesBySport[sport] || ['Premier League'];
    setFormData({
      ...formData,
      sport_type: sport,
      league_name: leagues[0] // Устанавливаем первую лигу по умолчанию
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.home_team.trim() || !formData.away_team.trim()) {
      alert('Пожалуйста, укажите обе команды');
      return;
    }
    
    if (formData.home_team.trim() === formData.away_team.trim()) {
      alert('Команды должны различаться');
      return;
    }
    
    if (!formData.event_datetime) {
      alert('Пожалуйста, укажите дату и время события');
      return;
    }
    
    // Формируем название события для отображения
    const eventName = `${formData.home_team} vs ${formData.away_team}`;
    
    const eventData = {
      name: eventName,
      home_team: formData.home_team.trim(),
      away_team: formData.away_team.trim(),
      sport_type: formData.sport_type,
      league_name: formData.league_name,
      event_datetime: formData.event_datetime,
      date: formData.event_datetime,
      type: formData.sport_type,
      expectedRevenue: Number(formData.expectedRevenue) || 50000,
      coefficient_1: parseFloat(formData.coefficient_1) || 2.0,
      coefficient_x: parseFloat(formData.coefficient_x) || 3.0,
      coefficient_2: parseFloat(formData.coefficient_2) || 2.5,
      id: Date.now(),
    };
    
    console.log('📝 Данные формы:', eventData);
    onAddEvent(eventData);
    onClose();
    const defaultLeagues = leaguesBySport['football'] || ['Premier League'];
    setFormData({ 
      home_team: '', 
      away_team: '', 
      sport_type: 'football', 
      league_name: defaultLeagues[0],
      event_datetime: '', 
      expectedRevenue: '',
      coefficient_1: '2.0',
      coefficient_x: '3.0',
      coefficient_2: '2.5',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg text-card-foreground bg-popover max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Добавить спортивное событие</h2>
            <p className="text-sm text-muted-foreground mt-1">Создайте матч с командами и коэффициентами для ставок</p>
          </div>
          <button onClick={onClose} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="home_team" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Домашняя команда
            </label>
            <input
              id="home_team"
              type="text"
              required
              value={formData.home_team}
              onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={
                formData.sport_type === 'football' 
                  ? 'Например: Ливерпуль' 
                  : formData.sport_type === 'basketball'
                  ? 'Например: Lakers'
                  : formData.sport_type === 'hockey'
                  ? 'Например: СКА'
                  : 'Название команды'
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="away_team" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Гостевая команда
            </label>
            <input
              id="away_team"
              type="text"
              required
              value={formData.away_team}
              onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={
                formData.sport_type === 'football' 
                  ? 'Например: Челси' 
                  : formData.sport_type === 'basketball'
                  ? 'Например: Warriors'
                  : formData.sport_type === 'hockey'
                  ? 'Например: ЦСКА'
                  : 'Название команды'
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sport_type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Вид спорта
              </label>
              <select
                id="sport_type"
                value={formData.sport_type}
                onChange={(e) => handleSportChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="football">⚽ Футбол</option>
                <option value="basketball">🏀 Баскетбол</option>
                <option value="hockey">🏒 Хоккей</option>
                <option value="tennis">🎾 Теннис</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="league_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Лига
              </label>
              <select
                id="league_name"
                value={formData.league_name}
                onChange={(e) => setFormData({ ...formData, league_name: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {availableLeagues.map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="event_datetime" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Дата и время события
            </label>
            <input
              id="event_datetime"
              type="datetime-local"
              required
              value={formData.event_datetime}
              onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Коэффициенты */}
          <div className="space-y-3 pt-4 border-t">
            <div>
              <label className="text-sm font-medium leading-none">Коэффициенты для ставок</label>
              <p className="text-xs text-muted-foreground mt-1">Укажите коэффициенты для каждой возможной ставки</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label htmlFor="coefficient_1" className="text-xs text-muted-foreground">
                  П1 (Победа {formData.home_team || 'домашней команды'})
                </label>
                <input
                  id="coefficient_1"
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="100"
                  required
                  value={formData.coefficient_1}
                  onChange={(e) => setFormData({ ...formData, coefficient_1: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="2.0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="coefficient_x" className="text-xs text-muted-foreground">
                  X (Ничья)
                </label>
                <input
                  id="coefficient_x"
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="100"
                  required
                  value={formData.coefficient_x}
                  onChange={(e) => setFormData({ ...formData, coefficient_x: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="3.0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="coefficient_2" className="text-xs text-muted-foreground">
                  П2 (Победа {formData.away_team || 'гостевой команды'})
                </label>
                <input
                  id="coefficient_2"
                  type="number"
                  step="0.01"
                  min="1.01"
                  max="100"
                  required
                  value={formData.coefficient_2}
                  onChange={(e) => setFormData({ ...formData, coefficient_2: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="2.5"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="revenue" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Ожидаемый доход ($)
            </label>
            <input
              id="revenue"
              type="number"
              min="0"
              value={formData.expectedRevenue}
              onChange={(e) => setFormData({ ...formData, expectedRevenue: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="50000"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
