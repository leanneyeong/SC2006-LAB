// test-db.js
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function testConnection() {
  try {
    // Get DATABASE_URL from environment variables
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable not found");
    }
    
    console.log("Connecting to database...");
    
    // Create postgres client
    const client = postgres(DATABASE_URL);
    
    // Create drizzle instance
    const db = drizzle(client);
    
    // Test with a simple raw SQL query
    console.log("Executing query...");
    const result = await client`SELECT * FROM car_park LIMIT 1`;
    
    console.log("Connection successful!");
    console.log("Query result:", result);
    
    // Close the connection
    await client.end();
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

testConnection();