/*import { env } from "~/env";

interface CarparkAvailabilitySchema {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: string;
  LotType: string;
  Agency: string;
}

interface EnhancedCarparkSchema extends CarparkAvailabilitySchema {
  coordinates?: { lat: number; lng: number } | null;
  distance?: number; // Distance in kilometers
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

// Area coordinates mapping (same as in your frontend)
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
  // Add more areas as needed
};

// Haversine formula to calculate distance between two points
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Ensure all inputs are valid numbers
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.warn('Invalid coordinates provided to calculateDistance', { lat1, lon1, lat2, lon2 });
    return 0;
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(2)); // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Get coordinates for a carpark based on its area or location
export const getCarparkCoordinates = (carpark: CarparkAvailabilitySchema): { lat: number; lng: number } | null => {
  // First try to get coordinates based on Area
  if (carpark.Area && areaCoordinates[carpark.Area]) {
    return areaCoordinates[carpark.Area];
  }
  
  // If the Location field has comma-separated coordinates, try to parse them
  if (carpark.Location && carpark.Location.includes(',')) {
    try {
      const [lat, lng] = carpark.Location.split(',').map(parseFloat);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    } catch (e) {
      console.error('Error parsing location coordinates:', e);
    }
  }
  
  // Use Singapore's center as fallback
  return areaCoordinates['Singapore'];
};

// Validate user location
export const validateUserLocation = (latitude: any, longitude: any): UserLocation | undefined => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  // Check if the values are valid numbers and within reasonable range for Singapore
  if (!isNaN(lat) && !isNaN(lng) && 
      lat >= 1.1 && lat <= 1.5 && // Singapore latitude range
      lng >= 103.6 && lng <= 104.1) { // Singapore longitude range
    return { latitude: lat, longitude: lng };
  }
  
  console.warn('Invalid user location provided', { latitude, longitude });
  return undefined;
};

// Updated function to get LTA carpark data with distance calculation
export const getLTACombinedCarparkAvailability = async (userLocation?: UserLocation) => {
  const url = "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";
  const options = {
    method: "GET",
    headers: { "AccountKey": env.LTA_API_KEY as string },
  };
  const results: EnhancedCarparkSchema[] = [];

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const json = await response.json();
    
    // Process each carpark and add distance if user location is provided
    json.value.forEach((carpark: CarparkAvailabilitySchema) => {
      const carparkCoords = getCarparkCoordinates(carpark);
      
      const enhancedCarpark: EnhancedCarparkSchema = {
        ...carpark,
        coordinates: carparkCoords
      };
      
      // Calculate distance if user location is provided and carpark coordinates are valid
      if (userLocation && carparkCoords) {
        enhancedCarpark.distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          carparkCoords.lat,
          carparkCoords.lng
        );
        
        // Double check the distance calculation worked correctly
        if (isNaN(enhancedCarpark.distance)) {
          console.warn('Invalid distance calculation result', { 
            userLocation, 
            carparkCoords, 
            carparkId: carpark.CarParkID 
          });
          enhancedCarpark.distance = 0;
        }
      }
      
      results.push(enhancedCarpark);
    });

    // Sort by distance if available
    if (userLocation) {
      results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    return results;
  } catch (error) {
    console.error("Error fetching LTA carpark data:", error);
    return [];
  }
};

// API route handler that accepts user location
export const carparkApiHandler = async (req: any, res: any) => {
  // Extract user location from request query parameters
  const { latitude, longitude } = req.query;
  let userLocation: UserLocation | undefined;
  
  // Validate user location
  userLocation = validateUserLocation(latitude, longitude);
  
  // Log the user location to help with debugging
  console.log('User location for API request:', userLocation);
  
  try {
    // Get carpark data with distance calculation
    const carparkData = await getLTACombinedCarparkAvailability(userLocation);
    
    // Include user location in response for debugging
    res.status(200).json({ 
      carparks: carparkData,
      meta: {
        userLocationProvided: !!userLocation,
        userLocation: userLocation || null
      }
    });
  } catch (error) {
    console.error('Error in carpark API handler:', error);
    res.status(500).json({ error: 'Failed to fetch carpark data' });
  }
};