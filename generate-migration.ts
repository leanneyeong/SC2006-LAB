import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import carParkSchema from './db/schema/carparks-schema';

dotenv.config();

// Create migrations directory if it doesn't exist
const migrationsDir = './drizzle';
if (!existsSync(migrationsDir)) {
  mkdirSync(migrationsDir, { recursive: true });
}

// Create the SQL for the car_park table
const tableSql = `
CREATE TABLE IF NOT EXISTS "car_park" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "car_park_no" text NOT NULL,
  "address" text,
  "x_coord" text,
  "y_coord" text,
  "car_park_type" text,
  "type_of_parking_system" text,
  "short_term_parking" text,
  "free_parking" text,
  "night_parking" text,
  "car_park_decks" text,
  "gantry_height" text,
  "car_park_basement" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
`;

// Write the migration file
const timestamp = new Date().getTime();
const migrationFile = path.join(migrationsDir, `${timestamp}_create_car_park_table.sql`);
writeFileSync(migrationFile, tableSql);
console.log(`Migration file created at ${migrationFile}`);