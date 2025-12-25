const { Pool } = require('pg');
const { Kysely, PostgresDialect } = require('kysely');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/looseline_auth?sslmode=disable';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
});

const db = new Kysely({
  dialect: new PostgresDialect({ pool }),
});

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Create user table
    await db.schema
      .createTable('user')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('email', 'varchar', (col) => col.notNull().unique())
      .addColumn('password', 'varchar', (col) => col.notNull())
      .addColumn('role', 'varchar', (col) => col.notNull().defaultTo('user'))
      .addColumn('emailVerified', 'boolean', (col) => col.defaultTo(false))
      .addColumn('name', 'varchar')
      .addColumn('image', 'varchar')
      .addColumn('createdAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .addColumn('banned', 'boolean', (col) => col.defaultTo(false))
      .addColumn('banReason', 'varchar')
      .addColumn('banExpires', 'timestamp')
      .execute();
    
    console.log('✅ user table created');
    
    // Create session table
    await db.schema
      .createTable('session')
      .ifNotExists()
      .addColumn('id', 'varchar', (col) => col.primaryKey())
      .addColumn('expiresAt', 'timestamp', (col) => col.notNull())
      .addColumn('token', 'varchar', (col) => col.notNull())
      .addColumn('createdAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .addColumn('ipAddress', 'varchar')
      .addColumn('userAgent', 'varchar')
      .addColumn('userId', 'varchar')
      .addColumn('impersonatedBy', 'varchar')
      .execute();
    
    console.log('✅ session table created');
    
    // Create account table
    await db.schema
      .createTable('account')
      .ifNotExists()
      .addColumn('id', 'varchar', (col) => col.primaryKey())
      .addColumn('accountId', 'varchar', (col) => col.notNull())
      .addColumn('providerId', 'varchar', (col) => col.notNull())
      .addColumn('userId', 'varchar', (col) => col.notNull())
      .addColumn('accessToken', 'varchar')
      .addColumn('refreshToken', 'varchar')
      .addColumn('idToken', 'varchar')
      .addColumn('accessTokenExpiresAt', 'timestamp')
      .addColumn('refreshTokenExpiresAt', 'timestamp')
      .addColumn('scope', 'varchar')
      .addColumn('password', 'varchar')
      .addColumn('createdAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .execute();
    
    console.log('✅ account table created');
    
    // Create verification table
    await db.schema
      .createTable('verification')
      .ifNotExists()
      .addColumn('id', 'varchar', (col) => col.primaryKey())
      .addColumn('identifier', 'varchar', (col) => col.notNull())
      .addColumn('value', 'varchar', (col) => col.notNull())
      .addColumn('expiresAt', 'timestamp', (col) => col.notNull())
      .addColumn('createdAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .execute();
    
    console.log('✅ verification table created');
    console.log('\n✅ All Better Auth tables created successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
