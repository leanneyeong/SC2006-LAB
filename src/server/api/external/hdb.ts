import { db } from '../../db';
import carParkSchema from '../../db/schema/carparks-schema';
import { eq, or } from 'drizzle-orm'; // Added 'or' import

interface CarparkAvailabilitySchema {
  carpark_number: string;
  carpark_info: LotSchema[];
}

interface LotSchema {
  total_lots: string;
  lot_type: string;
  lots_available: string;
}

// Define a unified schema that combines API and CSV data
interface EnhancedCarparkSchema {
  carpark_number: string;
  name?: string;  // Field to store the address as the display name
  total_lots: string;
  lots_available: string;
  lot_type: string;
  timestamp: string;
  // CSV data fields
  address?: string;
  x_coord?: string;
  y_coord?: string;
  car_park_type?: string;
  type_of_parking_system?: string;
  short_term_parking?: string;
  free_parking?: string;
  night_parking?: string;
  car_park_decks?: string;
  gantry_height?: string;
  car_park_basement?: string;
}

export const getHDBCarparkAvailability = async (): Promise<EnhancedCarparkSchema[]> => {
  const url = "https://api.data.gov.sg/v1/transport/carpark-availability";
  const options = { method: "GET" };
  const results: EnhancedCarparkSchema[] = [];

  try {
    console.log("Starting to fetch carpark availability data");
    
    // 1. Fetch real-time carpark availability data from API
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`API response received with ${data.items ? data.items.length : 0} items`);
    
    if (!data.items || data.items.length === 0) {
      console.error("API response missing items array or empty items");
      return [];
    }

    const items = data.items[0];
    const timestamp = items.timestamp;
    console.log(`Timestamp from API: ${timestamp}`);
    
    if (!items.carpark_data) {
      console.error("API response missing carpark_data");
      return [];
    }
    
    const carpark_data = items.carpark_data;
    console.log(`Retrieved info for ${carpark_data.length} carparks from API`);
    
    // Log a sample carpark to check the structure
    if (carpark_data.length > 0) {
      console.log("Sample carpark data structure:", JSON.stringify(carpark_data[0], null, 2));
    }

    // 2. Extract just the carpark numbers to query the database efficiently
    const carparkNumbers: string[] = carpark_data.map((carpark: CarparkAvailabilitySchema) => carpark.carpark_number);
    console.log(`Extracted ${carparkNumbers.length} carpark numbers for database lookup`);
    
    // 3. Fetch matching carpark details from our database using batched queries
    let dbCarparks: Array<typeof carParkSchema.$inferSelect> = [];
    
    try {
      if (carparkNumbers.length > 0) {
        // For small number of carparks, use OR condition
        if (carparkNumbers.length < 50) {
          const conditions = carparkNumbers.map((num: string) => eq(carParkSchema.carParkNo, num));
          dbCarparks = await db.select().from(carParkSchema).where(or(...conditions));
        } else {
          // For larger sets, query in batches of 50
          dbCarparks = [];
          for (let i = 0; i < carparkNumbers.length; i += 50) {
            const batch = carparkNumbers.slice(i, i + 50);
            const batchConditions = batch.map((num: string) => eq(carParkSchema.carParkNo, num));
            const batchResults = await db.select().from(carParkSchema).where(or(...batchConditions));
            dbCarparks.push(...batchResults);
          }
        }
        console.log(`Retrieved ${dbCarparks.length} carpark details from database`);
        
        // Log a sample from the database if available
        if (dbCarparks.length > 0) {
          console.log("Sample database record:", JSON.stringify(dbCarparks[0], null, 2));
        }
      }
    } catch (dbError) {
      console.error("Database query error:", dbError);
      dbCarparks = [];
    }
    
    // Create a case-insensitive lookup map for faster access
    const carparkDetailsMap = new Map();
    dbCarparks.forEach(carpark => {
      if (!carpark.carParkNo) {
        console.warn("Found database record with null carParkNo", carpark);
        return;
      }
      
      // Store with original case
      carparkDetailsMap.set(carpark.carParkNo, carpark);
      
      // Also store uppercase version for case-insensitive matching
      carparkDetailsMap.set(carpark.carParkNo.toUpperCase(), carpark);
      
      // If it has leading zeros, also store without them
      if (carpark.carParkNo.startsWith('0')) {
        carparkDetailsMap.set(carpark.carParkNo.replace(/^0+/, ''), carpark);
      }
      
      console.log(`Added to map: ${carpark.carParkNo} -> "${carpark.address || 'No address'}"`);
    });

    // 4. Combine API data with database data
    let matchCount = 0;
    let noMatchCount = 0;
    
    carpark_data.forEach((carpark: CarparkAvailabilitySchema) => {
      if (!carpark.carpark_number) {
        console.warn("Found API carpark with missing carpark_number", carpark);
        return;
      }
      
      const carpark_id = carpark.carpark_number;
      
      // Try multiple formats to find a match
      // First try direct match
      let dbCarpark = carparkDetailsMap.get(carpark_id);
      let matchMethod = "direct";
      
      // If not found, try uppercase
      if (!dbCarpark) {
        dbCarpark = carparkDetailsMap.get(carpark_id.toUpperCase());
        if (dbCarpark) matchMethod = "uppercase";
      }
      
      // If not found and no leading zeros, try with a leading zero
      if (!dbCarpark && !carpark_id.startsWith('0')) {
        dbCarpark = carparkDetailsMap.get('0' + carpark_id);
        if (dbCarpark) matchMethod = "added leading zero";
      }
      
      // If still not found and has leading zeros, try without them
      if (!dbCarpark && carpark_id.startsWith('0')) {
        const trimmedId = carpark_id.replace(/^0+/, '');
        dbCarpark = carparkDetailsMap.get(trimmedId);
        if (dbCarpark) matchMethod = "removed leading zeros";
      }
      
      // Detailed logging for troubleshooting
      if (dbCarpark) {
        matchCount++;
        console.log(`Match found for ${carpark_id} (${matchMethod}): Address = "${dbCarpark.address}"`);
      } else {
        noMatchCount++;
        console.log(`No match found for ${carpark_id} in database`);
      }
      
      if (!carpark.carpark_info) {
        console.log(`Warning: No carpark_info for ${carpark_id}`);
        return; // Skip this iteration
      }
      
      carpark.carpark_info.forEach((lots: LotSchema) => {
        // IMPORTANT: Explicitly extract and verify the address before using it
        const address = dbCarpark ? dbCarpark.address : null;
        const displayName = address ? address : carpark_id;
        
        console.log(`Creating result for ${carpark_id} with name = "${displayName}"`);
        
        // Create combined record with both API and database data
        const enhancedCarpark: EnhancedCarparkSchema = {
          carpark_number: carpark_id,
          name: displayName, // This is the key line
          total_lots: lots.total_lots,
          lots_available: lots.lots_available,
          lot_type: lots.lot_type,
          timestamp: timestamp,
        };
        
        // Add CSV data if available
        if (dbCarpark) {
          enhancedCarpark.address = dbCarpark.address;
          enhancedCarpark.x_coord = dbCarpark.xCoord;
          enhancedCarpark.y_coord = dbCarpark.yCoord;
          enhancedCarpark.car_park_type = dbCarpark.carParkType;
          enhancedCarpark.type_of_parking_system = dbCarpark.typeOfParkingSystem;
          enhancedCarpark.short_term_parking = dbCarpark.shortTermParking;
          enhancedCarpark.free_parking = dbCarpark.freeParking;
          enhancedCarpark.night_parking = dbCarpark.nightParking;
          enhancedCarpark.car_park_decks = dbCarpark.carParkDecks;
          enhancedCarpark.gantry_height = dbCarpark.gantryHeight;
          enhancedCarpark.car_park_basement = dbCarpark.carParkBasement;
        }
        
        results.push(enhancedCarpark);
      });
    });

    console.log(`Processing complete: ${matchCount} carparks matched with database, ${noMatchCount} not found`);
    console.log(`Total results generated: ${results.length}`);
    
    // Sample the first few results to verify structure
    if (results.length > 0) {
      console.log("Sample result:", JSON.stringify(results[0], null, 2));
    }

    return results;
  } catch (error) {
    console.error("Error fetching and combining HDB carpark data:", error);
    return [];
  }
};

// Optional helper function to get details for a specific carpark
export const getDetailedCarparkInfo = async (carparkNumber: string): Promise<EnhancedCarparkSchema | null> => {
  try {
    const allCarparkData = await getHDBCarparkAvailability();
    return allCarparkData.find(carpark => carpark.carpark_number === carparkNumber) || null;
  } catch (error) {
    console.error(`Error fetching details for carpark ${carparkNumber}:`, error);
    return null;
  }
};

export const testDatabaseLookup = async (carparkId: string) => {
  try {
    const result = await db.select().from(carParkSchema)
      .where(eq(carParkSchema.carParkNo, carparkId));
    
    console.log(`Lookup result for ${carparkId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error looking up ${carparkId}:`, error);
    return null;
  }
};