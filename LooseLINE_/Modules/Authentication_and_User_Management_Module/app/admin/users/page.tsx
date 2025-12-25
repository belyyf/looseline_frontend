// app/admin/page.tsx - СЕРВЕРНЫЙ КОМПОНЕНТ
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Users, CreditCard, Activity, UserCheck, Clock, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';
import Link from 'next/link';

// Компонент для статистики
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: string;
  link?: string;
};

const StatCard = ({ title, value, icon: Icon, description, trend, link }: StatCardProps) => {
  const content = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
            {trend && <span className="text-success ml-1">{trend}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link href={link}>
        {content}
      </Link>
    );
  }

  return content;
};

// Функция для получения данных дашборда
async function getDashboardData() {
  try {
    // 1. Всего пользователей
    const totalUsers = await db
      .selectFrom('user')
      .select(db.fn.countAll().as('count'))
      .executeTakeFirst();

    // 2. Активных пользователей (не забаненные)
    const activeUsers = await db
      .selectFrom('user')
      .select(db.fn.countAll().as('count'))
      .where('banned', '=', false)
      .executeTakeFirst();

    // 3. Забаненных пользователей
    const bannedUsers = await db
      .selectFrom('user')
      .select(db.fn.countAll().as('count'))
      .where('banned', '=', true)
      .executeTakeFirst();

    // 4. Администраторов
    const adminUsers = await db
      .selectFrom('user')
      .select(db.fn.countAll().as('count'))
      .where('role', '=', 'admin')
      .executeTakeFirst();

    // 5. Активных сессий (не истекшие)
    const activeSessions = await db
      .selectFrom('session')
      .select(db.fn.countAll().as('count'))
      .where('expiresAt', '>', new Date())
      .executeTakeFirst();

    // 6. Подключенные аккаунты (OAuth)
    const oauthAccounts = await db
      .selectFrom('account')
      .select(db.fn.countAll().as('count'))
      .where('providerId', '!=', 'email')
      .executeTakeFirst();

    // 7. Последние 5 пользователей
    const recentUsers = await db
      .selectFrom('user')
      .select(['id', 'name', 'email', 'createdAt', 'role', 'banned'])
      .orderBy('createdAt', 'desc')
      .limit(5)
      .execute();

    // 8. Пользователей по ролям
    const usersByRole = await db
      .selectFrom('user')
      .select(['role', db.fn.countAll().as('count')])
      .groupBy('role')
      .execute();

    // 9. Регистрации за последние 7 дней
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentRegistrations = await db
      .selectFrom('user')
      .select(db.fn.countAll().as('count'))
      .where('createdAt', '>', lastWeek)
      .executeTakeFirst();

    return {
      totalUsers: Number(totalUsers?.count) || 0,
      activeUsers: Number(activeUsers?.count) || 0,
      bannedUsers: Number(bannedUsers?.count) || 0,
      adminUsers: Number(adminUsers?.count) || 0,
      activeSessions: Number(activeSessions?.count) || 0,
      oauthAccounts: Number(oauthAccounts?.count) || 0,
      recentUsers,
      usersByRole: usersByRole.map(row => ({
        role: row.role || 'user',
        count: Number(row.count)
      })),
      recentRegistrations: Number(recentRegistrations?.count) || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      adminUsers: 0,
      activeSessions: 0,
      oauthAccounts: 0,
      recentUsers: [],
      usersByRole: [],
      recentRegistrations: 0,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  // Основные статистики
  const mainStats = [
    {
      title: 'Всего пользователей',
      icon: Users,
      value: data.totalUsers,
      description: `${data.recentRegistrations} за 7 дней`,
      link: '/admin/users'
    },
    {
      title: 'Активные пользователи',
      icon: UserCheck,
      value: data.activeUsers,
      description: `${data.bannedUsers} забанены`,
      link: '/admin/users?filter=active'
    },
    {
      title: 'Администраторы',
      icon: Shield,
      value: data.adminUsers,
      description: 'Управление системой',
      link: '/admin/users?role=admin'
    },
    {
      title: 'Активных сессий',
      icon: Activity,
      value: data.activeSessions,
      description: 'Сейчас онлайн'
    },
  ];

  // Второстепенные статистики
  const secondaryStats = [
    {
      title: 'OAuth аккаунтов',
      icon: CreditCard,
      value: data.oauthAccounts,
      description: 'Внешние авторизации'
    },
    {
      title: 'Новых регистраций',
      icon: TrendingUp,
      value: data.recentRegistrations,
      description: 'За 7 дней',
      trend: '+12%'
    },
    {
      title: 'Забанено',
      icon: AlertCircle,
      value: data.bannedUsers,
      description: 'Пользователей',
      link: '/admin/users?banned=true'
    },
    {
      title: 'Всего ролей',
      icon: Clock,
      value: data.usersByRole.length,
      description: 'Разных категорий'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Дашборд администратора</h1>
        <div className="text-sm text-muted-foreground">
          Обновлено: {new Date().toLocaleTimeString('ru-RU')}
        </div>
      </div>

      {/* Основная статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </div>

      {/* Вторичная статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {secondaryStats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Распределение по ролям */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Распределение по ролям</CardTitle>
          </CardHeader>
          <CardContent>
            {data.usersByRole.length > 0 ? (
              <div className="space-y-3">
                {data.usersByRole.map(({ role, count }) => {
                  const percentage = data.totalUsers > 0
                    ? Math.round((count / data.totalUsers) * 100)
                    : 0;

                  return (
                    <div key={role} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{role}</span>
                        <span className="text-muted-foreground">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${role === 'admin' ? 'bg-destructive' :
                              role === 'moderator' ? 'bg-warning' : 'bg-primary'
                            }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                Нет данных о ролях
              </div>
            )}
          </CardContent>
        </Card>

        {/* Последние пользователи */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Последние пользователи</CardTitle>
            <Link
              href="/admin/users"
              className="text-sm text-primary hover:underline"
            >
              Все пользователи →
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentUsers.length > 0 ? (
              <div className="space-y-3">
                {data.recentUsers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${user.banned ? 'bg-destructive' : 'bg-success'}`}></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name || user.email?.split('@')[0] || 'Без имени'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className={`px-2 py-1 rounded-full capitalize ${user.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                          'bg-primary/10 text-primary'
                        }`}>
                        {user.role}
                      </div>
                      <p className="text-muted-foreground mt-1">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                Нет пользователей
              </div>
            )}
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="flex items-center justify-center p-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Управление пользователями
              </Link>

              <Link
                href="/admin/users?banned=true"
                className="flex items-center justify-center p-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Управление банами
              </Link>

              <Link
                href="/admin/users?role=admin"
                className="flex items-center justify-center p-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Shield className="w-4 h-4 mr-2" />
                Назначить администратора
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}