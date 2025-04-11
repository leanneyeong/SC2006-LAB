import fs from 'node:fs';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import carParkSchema from './src/server/db/schema/carparks-schema.js';
import 'dotenv/config';

// Correct way to get Pool for ES modules
const Pool = pg.Pool;

// Use connection string from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_STRING || 
    'postgresql://postgres.qcuiawlgzbrpmummmmhn:Q0DUBsEPxk60iA0y@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
});

const db = drizzle(pool);

// Function to convert X,Y coordinates to point geometry
function createPointGeometry(x, y) {
  // Ensure x and y are numbers
  const safeX = typeof x === 'string' ? parseFloat(x) : x;
  const safeY = typeof y === 'string' ? parseFloat(y) : y;
  
  // Check if coordinates are valid numbers
  if (isNaN(safeX) || isNaN(safeY)) {
    console.warn(`Invalid coordinates: x=${x}, y=${y}`);
    return `SRID=3414;POINT(0 0)`;
  }
  
  return `SRID=3414;POINT(${safeX} ${safeY})`;
}

// Simple CSV parser function using built-in Node.js functionality
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  
  // Check if there's at least one line in the file
  if (lines.length === 0) {
    return [];
  }
  
  // Safely get the first line and handle if it's undefined
  const firstLine = lines[0] || '';
  const headers = firstLine.split(',').map(header => header.trim().replace(/"/g, ''));
  
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip undefined or empty lines
    if (!line || !line.trim()) continue;
    
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim().replace(/"/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Don't forget the last value
    values.push(currentValue.trim().replace(/"/g, ''));
    
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    
    records.push(record);
  }
  
  return records;
}

async function importCarParks() {
  try {
    console.log('Starting import process...');
    
    // Read CSV file
    const csvFilePath = path.resolve('./hdb-carparks.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Parse CSV using our custom function
    const records = parseCSV(fileContent);
    
    console.log(`Found ${records.length} records in CSV`);
    
    // Prepare database insertion
    console.log('Inserting data into database...');
    
    // Insert data one by one to ensure type safety
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const record of records) {
      try {
        // Validate required fields
        if (!record.car_park_no || !record.address || !record.x_coord || !record.y_coord) {
          console.warn('Skipping record with missing required fields:', record);
          skippedCount++;
          continue;
        }
        
        // Insert using Drizzle
        await db.insert(carParkSchema).values({
          carParkNo: record.car_park_no.toString(),
          address: record.address.toString(),
          location: createPointGeometry(record.x_coord, record.y_coord),
          carParkType: (record.car_park_type || '').toString(),
          typeOfParkingSystem: (record.type_of_parking_system || '').toString(),
          shortTermParking: (record.short_term_parking || '').toString(),
          freeParking: (record.free_parking || '').toString(),
          nightParking: (record.night_parking || '').toString(),
          carParkDecks: (record.car_park_decks || '0').toString(),
          gantryHeight: (record.gantry_height || '0').toString(),
          carParkBasement: (record.car_park_basement || 'N').toString(),
          availableLots: 0 // Default value
        });
        
        insertedCount++;
        
        // Log progress every 100 records
        if (insertedCount % 100 === 0) {
          console.log(`Inserted ${insertedCount}/${records.length} records...`);
        }
      } catch (err) {
        console.error('Error inserting record:', err);
        console.error('Problematic record:', record);
        skippedCount++;
      }
    }
    
    console.log(`Import completed!`);
    console.log(`Successfully inserted: ${insertedCount} records`);
    console.log(`Skipped: ${skippedCount} records`);
  } catch (error) {
    console.error('Error during import:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run the import function
await importCarParks().catch(console.error);