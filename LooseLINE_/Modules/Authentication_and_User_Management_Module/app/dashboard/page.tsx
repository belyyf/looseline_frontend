// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '../components/Header';

interface Bet {
  bet_id: number;
  user_id: string;
  event_id: number;
  event_name?: string;
  event_end_date?: string | null;
  expected_result?: string | null;
  bet_type: string;
  bet_amount: string;
  coefficient: string;
  potential_win: string;
  status: string;
  result: string | null;
  actual_win: string | null;
  placed_at: string;
}

interface Event {
  id: string;
  name: string;
  home_team: string;
  away_team: string;
  sport_type: string;
  event_datetime: string;
  coefficient_1: number;
  coefficient_x: number;
  coefficient_2: number;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bets, setBets] = useState<Bet[]>([]);
  const [betsLoading, setBetsLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth session...');

        // Better-auth с Kysely может использовать другие пути
        // Пробуем разные варианты
        const sessionPaths = [
          '/api/auth/session',
          '/api/auth/get-session',
          '/api/auth/me'
        ];

        let response;
        let lastError;

        for (const path of sessionPaths) {
          try {
            console.log(`Trying session path: ${path}`);
            response = await fetch(path, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            console.log(`Path ${path} status: ${response.status}`);

            if (response.ok) {
              break;
            }
          } catch (err) {
            lastError = err;
            console.log(`Path ${path} error:`, err);
          }
        }

        if (!response) {
          console.error('All session paths failed');
          setError('Не удалось проверить сессию');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        if (response.ok) {
          try {
            const data = await response.json();
            console.log('Session data:', data);

            // Better-auth может возвращать данные в разных форматах
            const userData = data.data?.user || data.user || data;

            if (userData?.email || userData?.id) {
              console.log('✅ User authenticated:', userData);
              setUser(userData);
            } else {
              console.log('❌ No user data in response');
              setError('Требуется авторизация');
              setTimeout(() => router.push('/login'), 1500);
            }
          } catch (jsonError) {
            console.error('❌ JSON parse error:', jsonError);
            setError('Ошибка данных сессии');
            setTimeout(() => router.push('/login'), 1500);
          }
        } else {
          console.log('❌ Session check failed with status:', response.status);

          // Пробуем прочитать текст ответа для отладки
          try {
            const text = await response.text();
            console.log('Response text:', text);
          } catch { }

          if (response.status === 404) {
            setError('Эндпоинт сессии не найден. Проверьте конфигурацию auth.');
          } else {
            setError(`Ошибка сервера: ${response.status}`);
          }

          setTimeout(() => router.push('/login'), 1500);
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setError('Ошибка соединения с сервером');
        setTimeout(() => router.push('/login'), 1500);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch user bets when user is loaded
  useEffect(() => {
    const fetchBets = async () => {
      if (!user?.id) return;

      setBetsLoading(true);
      try {
        // Betting API endpoint
        const response = await fetch(`/api/bets/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setBets(data);
          console.log('✅ Bets loaded:', data);
        } else {
          console.log('❌ Failed to fetch bets:', response.status);
        }
      } catch (err) {
        console.error('❌ Error fetching bets:', err);
      } finally {
        setBetsLoading(false);
      }
    };

    fetchBets();
  }, [user]);

  // Fetch available events
  useEffect(() => {
    const fetchEvents = async () => {
      setEventsLoading(true);
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          // Filter only upcoming events if needed, for now show all
          setEvents(data);
          console.log('✅ Events loaded:', data);
        } else {
          console.log('❌ Failed to fetch events:', response.status);
        }
      } catch (err) {
        console.error('❌ Error fetching events:', err);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('Logging out...');

      // Пробуем разные пути для выхода
      const logoutPaths = [
        '/api/auth/signout',
        '/api/auth/logout',
        '/api/auth/sign-out'
      ];

      let success = false;

      for (const path of logoutPaths) {
        try {
          console.log(`Trying logout path: ${path}`);
          const response = await fetch(path, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            console.log(`✅ Logout successful via ${path}`);
            success = true;
            break;
          }
        } catch (err) {
          console.log(`Path ${path} error:`, err);
        }
      }

      if (success) {
        router.push('/login');
        router.refresh();
      } else {
        console.log('❌ All logout paths failed');
        setError('Не удалось выйти из системы');
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError('Ошибка сети при выходе');
    } finally {
      setLoading(false);
    }
  };

  // Если все еще загружается
  if (loading && !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <p style={{
            marginBottom: '20px',
            color: '#4b5563',
            fontSize: '16px'
          }}>
            Проверка авторизации...
          </p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Если есть ошибка и нет пользователя
  if (error && !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ color: '#dc2626', fontSize: '20px' }}>⚠️</span>
              <span style={{ color: '#7f1d1d', fontSize: '16px' }}>{error}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <Link
              href="/login"
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                minWidth: '200px',
                textAlign: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Войти в аккаунт
            </Link>

            <Link
              href="/"
              style={{
                padding: '12px 24px',
                color: '#6b7280',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Если пользователь авторизован, показываем dashboard
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a252f'
    }}>
      <Header user={user} loading={loading} />

      {/* Основное содержимое */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <div style={{
          backgroundColor: '#2c3e50',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          padding: '40px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '30px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#27ae60',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.01em'
              }}>
                Добро пожаловать, {user?.name || user?.email?.split('@')[0] || 'Пользователь'}!
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                margin: 0
              }}>
                Рады видеть вас в личном кабинете
              </p>
            </div>
          </div>

          {/* Информационные карточки */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              backgroundColor: '#34495e',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>👤</span> Профиль
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px'
                  }}>
                    Email
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#ffffff',
                    fontWeight: 500,
                    wordBreak: 'break-all'
                  }}>
                    {user?.email || 'Не указан'}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px'
                  }}>
                    ID пользователя
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: '"JetBrains Mono", monospace',
                    wordBreak: 'break-all'
                  }}>
                    {user?.id || 'Не доступен'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#34495e',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#3498db',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚡</span> Статус
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px'
                  }}>
                    Статус аккаунта
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#ffffff',
                    fontWeight: 500
                  }}>
                    <span style={{
                      backgroundColor: 'rgba(39, 174, 96, 0.2)',
                      color: '#27ae60',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      Активен
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px'
                  }}>
                    Последняя активность
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#ffffff',
                    fontWeight: 500
                  }}>
                    Только что
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Секция доступных событий */}
          <div style={{
            marginTop: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🏆</span> Доступные события
            </h2>

            {eventsLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Загрузка событий...
              </div>
            ) : events.length === 0 ? (
              <div style={{
                backgroundColor: '#34495e',
                padding: '32px',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>Нет доступных событий</div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {events.map((event) => (
                  <div key={event.id} style={{
                    backgroundColor: '#34495e',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#3498db',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>{event.sport_type}</span>
                      <span style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)'
                      }}>{new Date(event.event_datetime).toLocaleString('ru-RU')}</span>
                    </div>
                    <h3 style={{
                      color: 'white',
                      fontWeight: 600,
                      marginBottom: '16px',
                      fontSize: '16px'
                    }}>
                      {event.home_team} vs {event.away_team}
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px'
                    }}>
                      <button style={{
                        backgroundColor: '#2c3e50',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        padding: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>1</div>
                        <div style={{ fontWeight: 'bold' }}>{event.coefficient_1}</div>
                      </button>
                      <button style={{
                        backgroundColor: '#2c3e50',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        padding: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>X</div>
                        <div style={{ fontWeight: 'bold' }}>{event.coefficient_x}</div>
                      </button>
                      <button style={{
                        backgroundColor: '#2c3e50',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        padding: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>2</div>
                        <div style={{ fontWeight: 'bold' }}>{event.coefficient_2}</div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Секция ставок пользователя */}
          <div style={{
            marginTop: '32px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#ffffff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🎰</span> Мои ставки
            </h2>

            {betsLoading ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                Загрузка ставок...
              </div>
            ) : bets.length === 0 ? (
              <div style={{
                backgroundColor: '#34495e',
                padding: '32px',
                borderRadius: '8px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎲</div>
                <div style={{ marginBottom: '8px' }}>У вас пока нет ставок</div>
                <a href="/sports" style={{
                  color: '#27ae60',
                  textDecoration: 'none',
                  fontWeight: 500
                }}>
                  Сделать первую ставку →
                </a>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#34495e',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#2c3e50'
                    }}>
                      <th style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Событие</th>
                      <th style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Ожидаемый<br />результат</th>
                      <th style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Сумма</th>
                      <th style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Коэф.</th>
                      <th style={{
                        padding: '14px 16px',
                        textAlign: 'right',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Выигрыш</th>
                      <th style={{
                        padding: '14px 16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Статус</th>
                      <th style={{
                        padding: '14px 16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bets.map((bet) => (
                      <tr key={bet.bet_id} style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        <td style={{
                          padding: '14px 16px',
                          color: '#ffffff',
                          fontSize: '14px'
                        }}>
                          {bet.event_name || `Событие #${bet.event_id}`}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          color: '#ffffff',
                          fontWeight: 500,
                          fontSize: '13px'
                        }}>
                          {bet.expected_result || (bet.bet_type === '1' ? 'П1' : bet.bet_type === 'X' ? 'X' : 'П2')}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          textAlign: 'right',
                          fontFamily: '"JetBrains Mono", monospace',
                          color: '#ffffff'
                        }}>
                          ${parseFloat(bet.bet_amount).toFixed(2)}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          textAlign: 'right',
                          fontFamily: '"JetBrains Mono", monospace',
                          color: '#3498db'
                        }}>
                          {parseFloat(bet.coefficient).toFixed(2)}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          textAlign: 'right',
                          fontFamily: '"JetBrains Mono", monospace',
                          color: bet.result === 'win' ? '#27ae60' : bet.result === 'loss' ? '#e74c3c' : '#ffffff'
                        }}>
                          ${bet.actual_win ? parseFloat(bet.actual_win).toFixed(2) : parseFloat(bet.potential_win).toFixed(2)}
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: bet.status === 'open'
                              ? 'rgba(241, 196, 15, 0.2)'
                              : bet.result === 'win'
                                ? 'rgba(39, 174, 96, 0.2)'
                                : 'rgba(231, 76, 60, 0.2)',
                            color: bet.status === 'open'
                              ? '#f1c40f'
                              : bet.result === 'win'
                                ? '#27ae60'
                                : '#e74c3c'
                          }}>
                            {bet.status === 'open' ? 'Открыта' : bet.result === 'win' ? 'Выигрыш' : 'Проигрыш'}
                          </span>
                        </td>
                        <td style={{
                          padding: '14px 16px',
                          textAlign: 'center'
                        }}>
                          {bet.status === 'open' && (
                            <button
                              onClick={async () => {
                                if (!confirm('Вы уверены, что хотите отменить эту ставку?')) return;
                                
                                try {
                                  const response = await fetch(`/api/bets/${bet.bet_id}/status`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      new_status: 'cancelled',
                                      reason: 'Отменено пользователем'
                                    })
                                  });

                                  if (response.ok) {
                                    const updatedBet = await response.json();
                                    // Обновляем список ставок
                                    const updatedBets = bets.map(b => 
                                      b.bet_id === bet.bet_id 
                                        ? { ...b, status: updatedBet.status || 'cancelled' }
                                        : b
                                    );
                                    setBets(updatedBets);
                                    alert('Ставка успешно отменена');
                                  } else {
                                    let errorMessage = 'Не удалось отменить ставку';
                                    try {
                                      const error = await response.json();
                                      errorMessage = error.detail || error.message || errorMessage;
                                    } catch {
                                      errorMessage = `Ошибка ${response.status}`;
                                    }
                                    alert(`Ошибка: ${errorMessage}`);
                                  }
                                } catch (err) {
                                  console.error('Error cancelling bet:', err);
                                  alert('Ошибка при отмене ставки');
                                }
                              }}
                              style={{
                                padding: '6px 16px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#c0392b';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#e74c3c';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              Отменить
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}