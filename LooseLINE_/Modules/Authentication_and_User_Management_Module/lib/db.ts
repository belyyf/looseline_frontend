// lib/db.ts

// 3. Импорты (move imports up if needed, but for now I will use full import or move it)
import { Pool } from 'pg';
import { Kysely, PostgresDialect, Generated } from 'kysely';

// 1. Переносим все типы прямо в этот файл
interface UserTable {
  id: Generated<string>;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  role: string | null; // Role might be optional if default is set in DB or via Auth
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
  password: string | null;
}

interface SessionTable {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string | null;
  impersonatedBy: string | null;
}

interface AccountTable {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  accessTokenExpiresAt: Date | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
  password: string | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

interface VerificationTable {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

// Главный интерфейс базы данных
interface RoleTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

interface PermissionTable {
  id: Generated<string>;
  roleId: string;
  action: string;
  resource: string;
  createdAt: Generated<Date>;
}

interface EventTable {
  id: Generated<string>;
  name: string;
  home_team: string;
  away_team: string;
  sport_type: string;
  league_name: string;
  event_datetime: Date;
  expected_revenue: number;
  coefficient_1: number;
  coefficient_x: number;
  coefficient_2: number;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface BetTable {
  id: Generated<string>;
  user_id: string;
  event_id: string;
  amount: number;
  bet_type: string;
  coefficient: number;
  potential_win: number;
  status: string;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

interface BalanceTable {
  user_id: string;
  amount: number;
  currency: string;
  updated_at: Generated<Date>;
}

interface DatabaseSchema {
  user: UserTable;
  session: SessionTable;
  account: AccountTable;
  verification: VerificationTable;
  role: RoleTable;
  permission: PermissionTable;
  event: EventTable;
  bet: BetTable;
  balance: BalanceTable;
}

// 2. Проверка переменных окружения
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// 3. Импорты
// import { Pool } from 'pg';
// import { Kysely, PostgresDialect } from 'kysely';

// 4. Создаем пул соединений
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 5. Обработка ошибок пула
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// 6. Создаем диалект
const dialect = new PostgresDialect({
  pool: pool,
});

// 7. Создаем экземпляр Kysely
const dbInstance = new Kysely<DatabaseSchema>({
  dialect,
  log: (event) => {
    if (event.level === 'error') {
      console.error('Kysely error:', event.error);
    }
  },
});

// 8. Экспортируем
export const db = dbInstance;
export default dbInstance;

// 9. Экспортируем типы
export type Database = DatabaseSchema;
export type { UserTable, SessionTable, AccountTable, VerificationTable, RoleTable, PermissionTable };