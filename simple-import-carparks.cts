import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool } = pg;

// Database connection configuration - Only change the database name to match your Supabase DB
const pool = new Pool({
  host: process.env.DB_HOST || 'db.qcuiawlgzbrpmummmhn.supabase.co', // Update with your Supabase host
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your-password-here', // Update with your password
  database: process.env.DB_NAME || 'postgres', // Default for Supabase
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

// Create point geometry function with correct string interpolation
function createPointGeometry(x: number, y: number): string {
  // This assumes SVY21 coordinates (Singapore's coordinate system)
  return `SRID=3414;POINT(${x} ${y})`;
}

// Simple CSV parser function using built-in Node.js functionality
function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n');
  
  // Check if there's at least one line in the file
  if (lines.length === 0) {
    return [];
  }
  
  // Safely get the first line and handle if it's undefined
  const firstLine = lines[0] || '';
  const headers = firstLine.split(',').map(header => header.trim().replace(/"/g, ''));
  
  const records: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip undefined or empty lines
    if (!line || !line.trim()) continue;
    
    const values: string[] = [];
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
    
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    
    records.push(record);
  }
  
  return records;
}

async function importCarParks(): Promise<void> {
  try {
    console.log('Starting import process...');
    
    // Read CSV file
    const csvFilePath = path.resolve('./hdb-carparks.csv'); // Update to your actual file path
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Parse CSV using our custom function
    const records = parseCSV(fileContent);
    
    console.log(`Found ${records.length} records in CSV`);
    
    // Get client from pool
    const client = await pool.connect();
    
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Insert each record
      let insertedCount = 0;
      
      for (const record of records) {
        try {
          // Extract coordinates and convert to numbers
          const x = parseFloat(record['X Coord'] || '0');
          const y = parseFloat(record['Y Coord'] || '0');
          
          // Insert using raw SQL query
          const query = `
            INSERT INTO car_park (
              car_park_no, 
              address, 
              location, 
              car_park_type, 
              type_of_parking_system, 
              short_term_parking, 
              free_parking, 
              night_parking, 
              car_park_decks, 
              gantry_height, 
              car_park_basement,
              available_lots
            ) VALUES ($1, $2, ST_GeomFromText($3, 3414), $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `;
          
          const values = [
            record['Car Park No'],
            record['Address'],
            createPointGeometry(x, y),
            record['Car Park Type'],
            record['Type Of Parking System'],
            record['Short Term Parking'],
            record['Free Parking'],
            record['Night Parking'],
            record['Car Park Decks'],
            record['Gantry Height'],
            record['Car Park Basement'],
            0 // Default available lots
          ];
          
          await client.query(query, values);
          
          insertedCount++;
          
          // Log progress every 100 records
          if (insertedCount % 100 === 0) {
            console.log(`Inserted ${insertedCount}/${records.length} records...`);
          }
        } catch (err) {
          console.error(`Error inserting record ${record['Car Park No']}:`, err instanceof Error ? err.message : String(err));
        }
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      
      console.log(`Import completed! Successfully inserted ${insertedCount} records.`);
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error during import:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  } finally {
    // Close pool
    await pool.end();
  }
}

// Run the import function
importCarParks().catch(console.error);