
import { db } from "../lib/db";
import { sql } from "kysely";

async function createRolesTables() {
    console.log("Creating roles and permissions tables...");

    try {
        // Create role table
        await sql`
      CREATE TABLE IF NOT EXISTS role (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `.execute(db);
        console.log("✅ Table 'role' created");

        // Create permission table
        await sql`
      CREATE TABLE IF NOT EXISTS permission (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "roleId" TEXT NOT NULL REFERENCES role(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `.execute(db);
        console.log("✅ Table 'permission' created");

        // Seed default roles if they don't exist
        const adminRole = await db.selectFrom('role')
            .where('name', '=', 'admin')
            .selectAll()
            .executeTakeFirst();

        if (!adminRole) {
            console.log("Seeding default roles...");
            await db.insertInto('role')
                .values([
                    { name: 'admin', description: 'Administrator with full access', updatedAt: new Date() },
                    { name: 'user', description: 'Standard user', updatedAt: new Date() },
                    { name: 'moderator', description: 'Can moderate content', updatedAt: new Date() }
                ])
                .execute();
            console.log("✅ Default roles seeded");
        }

    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        process.exit();
    }
}

createRolesTables();
