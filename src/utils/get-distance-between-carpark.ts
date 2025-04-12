import { getDistance } from "geolib";
import Location from "~/server/api/types/location";

// Global variable to store current location
let currentUserLocation: { latitude: number; longitude: number } | null = null;

// Update current location when available
if (typeof navigator !== 'undefined' && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      currentUserLocation = { latitude, longitude };
    },
    (error) => {
      console.error("Error getting location:", error);
    }
  );
}

const getDistanceBetweenCarPark = (location: Location): string => {
  // If we don't have current location yet, return placeholder
  if (!currentUserLocation) {
    return "Calculating...";
  }
  
  // Calculate distance
  const distance = getDistance(
    currentUserLocation,
    { latitude: location.y, longitude: location.x }
  ) / 1000; // convert m to km
  
  // Return formatted distance
  return distance.toFixed(2);
};

export default getDistanceBetweenCarPark