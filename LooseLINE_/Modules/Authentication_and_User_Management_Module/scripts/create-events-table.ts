
import { db } from "../lib/db";
import { sql } from "kysely";

async function createEventsTable() {
    console.log("Creating event table...");

    try {
        await sql`
      CREATE TABLE IF NOT EXISTS event (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        sport_type TEXT NOT NULL,
        league_name TEXT,
        event_datetime TIMESTAMP NOT NULL,
        expected_revenue NUMERIC DEFAULT 0,
        coefficient_1 NUMERIC DEFAULT 2.0,
        coefficient_x NUMERIC DEFAULT 3.0,
        coefficient_2 NUMERIC DEFAULT 2.5,
        status TEXT DEFAULT 'upcoming',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `.execute(db);
        console.log("✅ Table 'event' created");

    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        process.exit();
    }
}

createEventsTable();
