/*import dotenv from 'dotenv';
import { db } from '../../db';
import carParkSchema from '../../db/schema/carparks-schema';
import { eq, or } from 'drizzle-orm';  // Import 'or' instead of trying to use 'inArray'
import { HousingDevelopmentBoard } from '../external/housing-development-board';
dotenv.config();

// Define interfaces for each data source
interface HDBCarparkSchema {
  carpark_number: string;
  carpark_info: HDBLotSchema[];
}

interface HDBLotSchema {
  total_lots: string;
  lot_type: string;
  lots_available: string;
}

interface LTACarparkSchema {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: string;
  LotType: string;
  Agency: string;
}

interface URACarparkSchema {
  carparkNo: string;
  geometries: {
    coordinates: string;
  }[];
  lotsAvailable: string;
  lotType: string;
}

// User location interface
interface UserLocation {
  latitude: number;
  longitude: number;
}

// Define a unified schema for storing data from all sources
interface UnifiedCarparkSchema {
  id: string;
  agency: 'HDB' | 'LTA' | 'URA';
  name?: string;
  area?: string;
  location?: string;
  coordinates?: { lat: number; lng: number } | null;
  distance?: number; // Added distance field
  availableLots: number;
  totalLots?: number;
  lotType: string;
  lastUpdated: string;
  // Additional fields from CSV for HDB carparks
  address?: string;
  carParkType?: string;
  typeOfParkingSystem?: string;
  shortTermParking?: string;
  freeParking?: string;
  nightParking?: string;
  carParkDecks?: string;
  gantryHeight?: string;
  carParkBasement?: string;
}

// Area coordinates mapping - reusing your existing map
const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  'Tiong Bahru': { lat: 1.2847, lng: 103.8246 },
  'Commonwealth': { lat: 1.3022, lng: 103.7984 },
  'Redhill': { lat: 1.2896, lng: 103.8173 },
  'Bukit Merah': { lat: 1.2819, lng: 103.8239 },
  'Queenstown': { lat: 1.2942, lng: 103.7861 },
  'Ang Mo Kio': { lat: 1.3691, lng: 103.8454 },
  'Toa Payoh': { lat: 1.3340, lng: 103.8563 },
  'MacPherson': { lat: 1.3262, lng: 103.8854 },
  'Geylang East': { lat: 1.3236, lng: 103.8916 },
  'Bedok': { lat: 1.3236, lng: 103.9273 },
  'Tampines': { lat: 1.3546, lng: 103.9437 },
  'Pasir Ris': { lat: 1.3721, lng: 103.9493 },
  'Bukit Panjang': { lat: 1.3774, lng: 103.7640 },
  'Hougang': { lat: 1.3719, lng: 103.8930 },
  'Jurong West': { lat: 1.3404, lng: 103.7090 },
  'Yishun': { lat: 1.4304, lng: 103.8354 },
  'Woodlands': { lat: 1.4382, lng: 103.7890 },
  'Clementi': { lat: 1.3162, lng: 103.7649 },
  'Boon Lay': { lat: 1.3046, lng: 103.7075 },
  'Kreta Ayer': { lat: 1.2819, lng: 103.8414 },
  'Kallang Basin': { lat: 1.3075, lng: 103.8718 },
  'Singapore': { lat: 1.3521, lng: 103.8198 }, // Default center of Singapore
};

// Reuse your existing helper functions
const findAreaForHDBBlock = (blockId: string): string => {
  // Your existing implementation
  return 'Singapore'; // Default fallback
};

const getHDBCarparkCoordinates = (carpark_id: string, dbCarpark: any): { lat: number; lng: number } | null => {
    // Try to get coordinates from database first if available
    if (dbCarpark?.latitude && dbCarpark?.longitude) {
      return { 
        lat: parseFloat(dbCarpark.latitude), 
        lng: parseFloat(dbCarpark.longitude) 
      };
    }
    
    // Use your existing function to get area
    const area = findAreaForHDBBlock(carpark_id);
    
    // Use your existing areaCoordinates map
    if (area && areaCoordinates[area]) {
      return areaCoordinates[area];
    }
  };

const generateHDBCarparkName = (blockId: string): string | undefined => {
  // Your existing implementation
  return undefined;
};

// Calculate distance between coordinates - reuse your existing function
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
  };

// UPDATED: Function to fetch HDB carpark data with FIXED database query
export const getHDBCarparkAvailability = async (userLocation?: UserLocation): Promise<UnifiedCarparkSchema[]> => {
    const hdb = new HousingDevelopmentBoard()
    const carpark_data = await hdb.getAvailability();

    // 2. Extract carpark numbers to query the database efficiently
    const carparkNumbers = carpark_data.map((carpark) => carpark.carpark_number);
    console.log(`Found ${carparkNumbers.length} HDB carpark numbers`);
    
    // FIXED: Database query approach
    let dbCarparks = [];
    try {
      if (carparkNumbers.length > 0) {
        // For small number of carparks, use individual queries or OR condition
        if (carparkNumbers.length < 50) {
          // Using OR conditions for a reasonable number of values
          const conditions = carparkNumbers.map(num => eq(carParkSchema.carParkNo, num));
          dbCarparks = await db.select().from(carParkSchema).where(or(...conditions));
        } else {
          // For larger sets, query in batches of 50
          dbCarparks = [];
          for (let i = 0; i < carparkNumbers.length; i += 50) {
            const batch = carparkNumbers.slice(i, i + 50);
            const batchConditions = batch.map(num => eq(carParkSchema.carParkNo, num));
            const batchResults = await db.select().from(carParkSchema).where(or(...batchConditions));
            dbCarparks.push(...batchResults);
          }
        }
        console.log(`Retrieved ${dbCarparks.length} carpark details from database`);
      }
    } catch (dbError) {
      console.error("Database query error:", dbError);
      // Continue with the API data even if DB query fails
      dbCarparks = [];
    }
    
    // Create a lookup map for faster access
    const carparkDetailsMap = new Map();
    dbCarparks.forEach(carpark => {
      carparkDetailsMap.set(carpark.carParkNo, carpark);
    });

    // 4. Process each carpark
    carpark_data.forEach((carpark: HDBCarparkSchema) => {
      const carpark_id = carpark.carpark_number;
      
      // Determine area based on carpark ID
      const area = findAreaForHDBBlock(carpark_id);
      
      // Generate name if possible
      const name = generateHDBCarparkName(carpark_id);
      
      // Get additional details from database
      const dbCarpark = carparkDetailsMap.get(carpark_id);
      
      // Get coordinates
      const coordinates = getHDBCarparkCoordinates(carpark_id, dbCarpark);

      carpark.carpark_info.forEach((lot: HDBLotSchema) => {
        const carparkEntry: UnifiedCarparkSchema = {
          id: carpark_id,
          agency: 'HDB',
          name: name,
          area: area,
          availableLots: parseInt(lot.lots_available) || 0,
          totalLots: parseInt(lot.total_lots) || 0,
          lotType: lot.lot_type,
          lastUpdated: timestamp,
          // Add coordinates
          coordinates: coordinates,
          // Add CSV data if available
          address: dbCarpark?.address,
          carParkType: dbCarpark?.carParkType,
          typeOfParkingSystem: dbCarpark?.typeOfParkingSystem,
          shortTermParking: dbCarpark?.shortTermParking,
          freeParking: dbCarpark?.freeParking,
          nightParking: dbCarpark?.nightParking,
          carParkDecks: dbCarpark?.carParkDecks,
          gantryHeight: dbCarpark?.gantryHeight,
          carParkBasement: dbCarpark?.carParkBasement,
        };
        
        // Calculate distance if user location is provided and coordinates are valid
        if (userLocation && coordinates) {
          carparkEntry.distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            coordinates.lat,
            coordinates.lng
          );
          
          // Ensure distance is properly formatted
          if (isNaN(carparkEntry.distance)) {
            console.warn('Invalid distance calculation for HDB carpark', { carpark_id, coordinates, userLocation });
            carparkEntry.distance = 0;
          }
        }
        
        results.push(carparkEntry);
      });
    });

    // Sort by distance if user location is provided
    if (userLocation) {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    console.log(`Returning ${results.length} HDB carpark entries`);
    return results;
  } catch (error) {
    console.error("Error fetching HDB carpark data:", error);
    return [];
  }
};

// UPDATED: Function to fetch LTA carpark data with improved error handling
export const getLTACarparkAvailability = async (userLocation?: UserLocation): Promise<UnifiedCarparkSchema[]> => {
  const url = "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";
  const apiKey = process.env.LTA_API_KEY;
  
  // Check if API key is available
  if (!apiKey) {
    console.error("LTA API key is missing. Check your environment variables.");
    return [];
  }
  
  const options = {
    method: "GET",
    headers: { "AccountKey": apiKey },
  };
  const results: UnifiedCarparkSchema[] = [];

  try {
    console.log("Fetching LTA carpark data...");
    
    const response = await fetch(url, options);
    console.log(`LTA API response status: ${response.status}`);
    
    if (!response.ok) {
      let errorText = "Unknown error";
      try {
        errorText = await response.text();
      } catch (e) {}
      
      console.error(`LTA API error: Status ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const json = await response.json();
    console.log(`LTA API returned data with ${json.value?.length || 0} carparks`);
    
    if (!json.value || !Array.isArray(json.value)) {
      console.error("Invalid LTA API response format");
      return [];
    }
    
    const timestamp = new Date().toISOString();

    json.value.forEach((carpark: LTACarparkSchema) => {
      // Get coordinates for this carpark
      let coordinates = null;
      if (carpark.Location && carpark.Location.includes(',')) {
        try {
          const [lat, lng] = carpark.Location.split(',').map(parseFloat);
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = { lat, lng };
          }
        } catch (e) {
          console.error("Error parsing LTA coordinates", e);
        }
      } else if (carpark.Area && areaCoordinates[carpark.Area]) {
        coordinates = areaCoordinates[carpark.Area];
      }
      
      const carparkEntry: UnifiedCarparkSchema = {
        id: carpark.CarParkID,
        agency: 'LTA',
        name: carpark.Development,
        area: carpark.Area,
        location: carpark.Location,
        coordinates: coordinates,
        availableLots: parseInt(carpark.AvailableLots) || 0,
        lotType: carpark.LotType,
        lastUpdated: timestamp
      };
      
      // Calculate distance if user location is provided and coordinates are valid
      if (userLocation && coordinates) {
        carparkEntry.distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          coordinates.lat,
          coordinates.lng
        );
        
        // Ensure distance is properly formatted
        if (isNaN(carparkEntry.distance)) {
          console.warn('Invalid distance calculation for LTA carpark', { id: carpark.CarParkID, coordinates, userLocation });
          carparkEntry.distance = 0;
        }
      }
      
      results.push(carparkEntry);
    });

    // Sort by distance if user location is provided
    if (userLocation) {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    console.log(`Returning ${results.length} LTA carpark entries`);
    return results;
  } catch (error) {
    console.error("Error fetching LTA carpark data:", error);
    return [];
  }
};

// Rest of your code remains the same
export const getURACarparkAvailability = async (userLocation?: UserLocation): Promise<UnifiedCarparkSchema[]> => {
  // Your existing URA implementation
  const url = "https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability";
  const accessKey = process.env.URA_ACCESS_KEY;
  const token = process.env.URA_TOKEN;
  
  // Check if API keys are available
  if (!accessKey || !token) {
    console.error("URA API keys are missing. Check your environment variables.");
    return [];
  }
  
  const options = {
    method: "GET",
    headers: {
      "AccessKey": accessKey,
      "Token": token,
      "User-Agent": "curl/7.68.0",
    },
  };
  const results: UnifiedCarparkSchema[] = [];

  try {
    console.log("Fetching URA carpark data...");
    
    const response = await fetch(url, options);
    console.log(`URA API response status: ${response.status}`);
    
    if (!response.ok) {
      let errorText = "Unknown error";
      try {
        errorText = await response.text();
      } catch (e) {}
      
      console.error(`URA API error: Status ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`URA API returned data with ${data.Result?.length || 0} carparks`);
    
    if (!data.Result || !Array.isArray(data.Result)) {
      console.error("Invalid URA API response format");
      return [];
    }
    
    const timestamp = new Date().toISOString();

    // Handle URA's specific response structure
    data.Result.forEach((carpark: URACarparkSchema) => {
      // Try to parse coordinates if available
      let coordinates = null;
      if (carpark.geometries && carpark.geometries[0] && carpark.geometries[0].coordinates) {
        try {
          const coordStr = carpark.geometries[0].coordinates;
          const [lng, lat] = coordStr.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = { lat, lng };
          }
        } catch (e) {
          console.error("Error parsing URA coordinates", e);
        }
      }

      const carparkEntry: UnifiedCarparkSchema = {
        id: carpark.carparkNo,
        agency: 'URA',
        area: 'Urban Redevelopment Area', // Default area for URA carparks
        coordinates: coordinates,
        availableLots: parseInt(carpark.lotsAvailable) || 0,
        lotType: carpark.lotType,
        lastUpdated: timestamp
      };
      
      // Calculate distance if user location is provided and coordinates are valid
      if (userLocation && coordinates) {
        carparkEntry.distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          coordinates.lat,
          coordinates.lng
        );
        
        // Ensure distance is properly formatted
        if (isNaN(carparkEntry.distance)) {
          console.warn('Invalid distance calculation for URA carpark', { id: carpark.carparkNo, coordinates, userLocation });
          carparkEntry.distance = 0;
        }
      }
      
      results.push(carparkEntry);
    });

    // Sort by distance if user location is provided
    if (userLocation) {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    console.log(`Returning ${results.length} URA carpark entries`);
    return results;
  } catch (error) {
    console.error("Error fetching URA carpark data:", error);
    return [];
  }
};

// Main function to fetch data from all sources with user location
// Main function to fetch data from all sources with user location
export const getAllCarparkAvailability = async (userLocation?: UserLocation): Promise<{
    carparks: UnifiedCarparkSchema[],
    stats: {
      totalCarparks: number,
      totalAvailableLots: number,
      byAgency: {
        HDB: number,
        LTA: number,
        URA: number
      }
    },
    meta: {
      userLocationProvided: boolean,
      userLocation: UserLocation | null
    }
  }> => {
    try {
      // Log the user location for debugging
      console.log('User location for unified carpark API:', userLocation);
      
      // Fetch data from all sources concurrently with user location
      const [hdbData, ltaData, uraData] = await Promise.all([
        getHDBCarparkAvailability(userLocation),
        getLTACarparkAvailability(userLocation),
        getURACarparkAvailability(userLocation)
      ]);
  
      console.log(`Data sources returned: HDB=${hdbData.length}, LTA=${ltaData.length}, URA=${uraData.length}`);
  
      // Create a Map to track unique carparks and detect duplicates
      const uniqueCarparks = new Map();
      const duplicatesRemoved = [];
  
      // Helper function to normalize carpark IDs for comparison
      const normalizeId = (id: string): string => {
        return id.trim().toUpperCase().replace(/^0+/, ''); // Remove leading zeros and normalize case
      };
  
      // Process HDB carparks first as they typically have more detailed information
      hdbData.forEach(carpark => {
        const normalizedId = normalizeId(carpark.id);
        uniqueCarparks.set(normalizedId, carpark);
      });
  
      // Process LTA carparks, only adding if not a duplicate of an HDB carpark
      ltaData.forEach(carpark => {
        const normalizedId = normalizeId(carpark.id);
        
        // If this ID already exists and it's from a different agency, it's a duplicate
        if (uniqueCarparks.has(normalizedId)) {
          const existingCarpark = uniqueCarparks.get(normalizedId);
          if (existingCarpark.agency !== carpark.agency) {
            duplicatesRemoved.push({
              id: carpark.id,
              agency: carpark.agency,
              duplicateOf: {
                id: existingCarpark.id,
                agency: existingCarpark.agency
              }
            });
            
            // Don't overwrite HDB data with LTA data
            return;
          }
        }
        
        // Add if not a duplicate or if it's from same agency (different lot type perhaps)
        uniqueCarparks.set(normalizedId, carpark);
      });
  
      // Process URA carparks, similar approach
      uraData.forEach(carpark => {
        const normalizedId = normalizeId(carpark.id);
        
        if (uniqueCarparks.has(normalizedId)) {
          const existingCarpark = uniqueCarparks.get(normalizedId);
          if (existingCarpark.agency !== carpark.agency) {
            duplicatesRemoved.push({
              id: carpark.id,
              agency: carpark.agency,
              duplicateOf: {
                id: existingCarpark.id,
                agency: existingCarpark.agency
              }
            });
            
            // Don't overwrite existing data with URA data
            return;
          }
        }
        
        uniqueCarparks.set(normalizedId, carpark);
      });
  
      // Get the final deduplicated list
      const allCarparks = Array.from(uniqueCarparks.values());
  
      // Log duplicate information
      if (duplicatesRemoved.length > 0) {
        console.log(`Removed ${duplicatesRemoved.length} duplicate carparks:`, duplicatesRemoved);
      }
  
      // Calculate agency counts after deduplication
      const hdbCount = allCarparks.filter(cp => cp.agency === 'HDB').length;
      const ltaCount = allCarparks.filter(cp => cp.agency === 'LTA').length;
      const uraCount = allCarparks.filter(cp => cp.agency === 'URA').length;
  
      // Calculate some basic statistics
      const stats = {
        totalCarparks: allCarparks.length,
        totalAvailableLots: allCarparks.reduce((sum: number, cp: UnifiedCarparkSchema) => sum + (cp.availableLots || 0), 0),
        byAgency: {
          HDB: hdbCount,
          LTA: ltaCount,
          URA: uraCount
        }
      };
  
      // Sort the combined results by distance if user location is provided
      if (userLocation) {
        allCarparks.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        
        // Add this after sorting carparks by distance
        if (userLocation) {
          allCarparks.forEach(carpark => {
            if (carpark.coordinates && !carpark.distance) {
              carpark.distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                carpark.coordinates.lat,
                carpark.coordinates.lng
              );
            }
            
            // If distance is 0 or not set, make sure it's at least a small value
            if (!carpark.distance) {
              carpark.distance = 0.01;
            }
          });
        }
      }
  
      console.log(`Returning combined data with ${allCarparks.length} total carparks after deduplication`);
      return {
        carparks: allCarparks,
        stats,
        meta: {
          userLocationProvided: !!userLocation,
          userLocation: userLocation || null
        }
      };
    } catch (error) {
      console.error("Error fetching combined carpark data:", error);
      return {
        carparks: [],
        stats: {
          totalCarparks: 0,
          totalAvailableLots: 0,
          byAgency: { HDB: 0, LTA: 0, URA: 0 }
        },
        meta: {
          userLocationProvided: !!userLocation,
          userLocation: userLocation || null
        }
      };
    }
  };

// API route handler that accepts user location
export const carparkApiHandlerUnified = async (req: any, res: any) => {
    // Extract user location from request query parameters
    const { latitude, longitude } = req.query;
    let userLocation: UserLocation | undefined;
    
    // Validate user location
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      
      // Check if the values are valid numbers and within reasonable range for Singapore
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= 1.1 && lat <= 1.5 && // Singapore latitude range
          lng >= 103.6 && lng <= 104.1) { // Singapore longitude range
        userLocation = { latitude: lat, longitude: lng };
        console.log('Valid user location received:', userLocation);
      } else {
        console.warn('Invalid coordinates received:', { latitude, longitude });
      }
    } else {
      console.log('No user location provided in request');
    }
    
    try {
      // Get carpark data with distance calculation
      // Using your existing getAllCarparkAvailability function
      const carparkData = await getAllCarparkAvailability(userLocation);
      
      res.status(200).json({
        ...carparkData,
        meta: {
          ...carparkData.meta,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in unified carpark API handler:', error);
      res.status(500).json({ 
        error: 'Failed to fetch carpark data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };