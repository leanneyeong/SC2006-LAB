/**
 * Represents a car park location in Singapore
 */
interface CarParkInfo {
  /** Unique identifier for the car park */
  CarParkID: string;
  
  /** Area where the car park is located (e.g., "Marina", "Orchard", "Harbfront") */
  Area: string;
  
  /** Name of the development or building where the car park is located */
  Development: string;
  
  /** Geographic coordinates of the car park (latitude and longitude as string) */
  Location: string;
  
  /** Number of available parking lots */
  AvailableLots: number;
  
  /** Type of parking lot (e.g., "C" for cars, "H" and "Y" for other vehicle types) */
  LotType: string;
  
  /** Agency managing the car park (e.g., "LTA", "HDB", "URA") */
  Agency: string;
}

/**
 * Car park information with parsed location coordinates
 */
interface EnhancedCarParkInfo extends Omit<CarParkInfo, 'Location'> {
  /** Latitude coordinate */
  lat: number;
  
  /** Longitude coordinate */
  lng: number;
}

/**
 * Simplified car park availability information
 */
interface SimplifiedCarParkInfo {
  /** Unique identifier for the car park */
  CarParkID: string;
  
  /** Type of parking lot */
  LotType: string;
  
  /** Number of available parking lots */
  AvailableLots: number;
}

/**
 * Root structure of the car park availability data
 */
interface CarParkAvailabilityResponse {
  /** OData metadata URL */
  "odata.metadata": string;
  
  /** Array of car park information objects */
  value: CarParkInfo[];
}

// Import data using ES module syntax instead of require
import carparkDataJson from './data.json';
export const carparkData: CarParkAvailabilityResponse = carparkDataJson as CarParkAvailabilityResponse;

/**
 * Fetches car park availability data from LTA Datamall API
 * @returns Promise with car park availability data
 */
export const getCarparkAvailability = async (): Promise<CarParkAvailabilityResponse> => {
  // get carpark availability data from LTA Datamall API
  const LTA_API_KEY = "8AEv+OxXR1CFUZ+NJS8kag==";
  const url =
    "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { AccountKey: LTA_API_KEY },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const json = await response.json() as CarParkAvailabilityResponse;
    return json;
  } catch (error) {
    console.log(error);
    // Return empty response in case of error
    return { "odata.metadata": "", value: [] };
  }
};

/**
 * Returns simplified carpark availability information
 * @returns Array of simplified car park info objects
 */
export const getUpdatedAvailabilityLot = (): SimplifiedCarParkInfo[] => {
  return carparkData.value.map(carpark => {
    return {
      CarParkID: carpark.CarParkID,
      LotType: carpark.LotType,
      AvailableLots: carpark.AvailableLots,
    };
  });
};

/**
 * Formats carpark data by splitting location string into latitude and longitude
 * @param carparkData The raw carpark data
 * @returns Array of enhanced car park info with parsed coordinates
 */
export const formatCarparkData = (carparkData: CarParkAvailabilityResponse): EnhancedCarParkInfo[] => {
  // carpark location given in api is string
  // need to split into lat/lng and change type to float
  return carparkData.value.map(carpark => {
    let lat = 0;
    let lng = 0;
    
    if (carpark.Location && typeof carpark.Location === 'string') {
      const coords = carpark.Location.split(" ");
      if (coords.length >= 2) {
        // Ensure coords are strings before parsing
        const parsedLat = parseFloat(String(coords[0]));
        const parsedLng = parseFloat(String(coords[1]));
        
        lat = !isNaN(parsedLat) ? parsedLat : 0;
        lng = !isNaN(parsedLng) ? parsedLng : 0;
      }
    }
    
    return { 
      ...carpark,
      lat,
      lng
    };
  });
};