import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import carParkSchema from '../../server/db/schema/carparks-schema';

dotenv.config();

// Your database connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Set up the database connection
const sql = postgres(connectionString);
const db = drizzle(sql);

// Import CSV data
async function importCsv() {
  try {
    console.log('Reading CSV file...');
    // Replace with the path to your CSV file
    const csvData = readFileSync('./path/to/your/carpark-data.csv', 'utf8');
    
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} records in CSV`);
    
    // Transform CSV records to match your schema
    const carParks = records.map(record => ({
      carParkNo: record.car_park_no || record.carpark_number,
      address: record.address,
      xCoord: record.x_coord,
      yCoord: record.y_coord,
      carParkType: record.car_park_type,
      typeOfParkingSystem: record.type_of_parking_system,
      shortTermParking: record.short_term_parking,
      freeParking: record.free_parking,
      nightParking: record.night_parking,
      carParkDecks: record.car_park_decks,
      gantryHeight: record.gantry_height,
      carParkBasement: record.car_park_basement
    }));
    
    console.log('Importing data into database...');
    
    // Insert data in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < carParks.length; i += batchSize) {
      const batch = carParks.slice(i, i + batchSize);
      await db.insert(carParkSchema).values(batch);
      console.log(`Imported batch ${i/batchSize + 1}/${Math.ceil(carParks.length/batchSize)}`);
    }
    
    console.log('CSV import completed successfully');
  } catch (error) {
    console.error('CSV import failed:', error);
  } finally {
    await sql.end();
  }
}

importCsv();