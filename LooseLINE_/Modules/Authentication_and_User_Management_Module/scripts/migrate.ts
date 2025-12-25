import { db } from '../lib/db';

async function migrate() {
  try {
    // Create users table if it doesn't exist
    await db.schema
      .createTable('user')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('email', 'varchar', (col) => col.notNull().unique())
      .addColumn('password', 'varchar', (col) => col.notNull())
      .addColumn('role', 'varchar', (col) => col.notNull().defaultTo('user'))
      .addColumn('createdAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .addColumn('updatedAt', 'timestamp', (col) => col.defaultTo('now()').notNull())
      .execute();

    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

migrate();
