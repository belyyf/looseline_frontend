
import { Pool } from 'pg';
import { Kysely, PostgresDialect, sql, ColumnDefinitionBuilder } from 'kysely';
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
  }),
});

async function run() {
  try {
    console.log('Creating betting tables...');

    // Create Balance Table
    await db.schema
      .createTable('balance')
      .ifNotExists()
      .addColumn('user_id', 'text', (col: ColumnDefinitionBuilder) => col.primaryKey()) // user_id is PK
      .addColumn('amount', 'numeric', (col: ColumnDefinitionBuilder) => col.notNull().defaultTo(0))
      .addColumn('currency', 'text', (col: ColumnDefinitionBuilder) => col.notNull().defaultTo('RUB'))
      .addColumn('updated_at', 'timestamp', (col: ColumnDefinitionBuilder) => col.notNull().defaultTo(sql`now()`))
      .execute();

    console.log("✅ Table 'balance' created");

    // Create Bet Table
    await db.schema
      .createTable('bet')
      .ifNotExists()
      .addColumn('id', 'text', (col: ColumnDefinitionBuilder) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
      .addColumn('user_id', 'text', (col: ColumnDefinitionBuilder) => col.notNull())
      .addColumn('event_id', 'text', (col: ColumnDefinitionBuilder) => col.notNull()) // Ensure this matches event.id type
      .addColumn('amount', 'numeric', (col: ColumnDefinitionBuilder) => col.notNull())
      .addColumn('bet_type', 'text', (col: ColumnDefinitionBuilder) => col.notNull()) // '1', 'X', '2'
      .addColumn('coefficient', 'numeric', (col: ColumnDefinitionBuilder) => col.notNull())
      .addColumn('potential_win', 'numeric', (col: ColumnDefinitionBuilder) => col.notNull())
      .addColumn('status', 'text', (col: ColumnDefinitionBuilder) => col.notNull().defaultTo('pending')) // pending, won, lost
      .addColumn('created_at', 'timestamp', (col: ColumnDefinitionBuilder) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updated_at', 'timestamp', (col: ColumnDefinitionBuilder) => col.notNull().defaultTo(sql`now()`))
      .execute();

    console.log("✅ Table 'bet' created");

  } catch (e) {
    console.error("Error creating tables:", e);
  } finally {
    await db.destroy();
  }
}

run();
