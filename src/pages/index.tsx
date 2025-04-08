import React, { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { TopBar } from "~/components/global/top-bar-home";
import { Navigation } from "~/components/global/navigation";
import MapView from "~/components/map/map-view";
import { useRouter } from "next/router";
import { RefreshCw, MapPin } from "lucide-react";

interface ParkingLocation {
  name: string;
  location: string;
  price: string;
  availability: string;
  availabilityColor: string;
}

interface PricingData {
  weekday: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  weekend: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

interface CarparkData {
  Development: string;
  Area: string;
  AvailableLots: string;
  LotType: string;
  Agency: string;
  availabilityColor: string;
  id?: string;
  // New field for pricing data
  pricing?: PricingData;
  // Location and distance
  latitude?: number;
  longitude?: number;
  distance?: number; // in kilometers
  // Additional fields from CSV database for HDB carparks
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

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Mapping of HDB block ranges to areas in Singapore
const estateMap: Record<string, string> = {
  '1-50': 'Tiong Bahru',
  // ... existing estateMap entries
};

// Specific locations for known carparks
const carparkLocationMap: Record<string, string> = {
  // ... existing carparkLocationMap entries
};

// NEW: Coordinates for Singapore areas/regions
// This is a simplified mapping - in a real app, you'd have more precise coordinates for each carpark
const areaCoordinates: Record<string, Coordinates> = {
  'Tiong Bahru': { latitude: 1.2847, longitude: 103.8246 },
  'Commonwealth': { latitude: 1.3022, longitude: 103.7984 },
  'Redhill': { latitude: 1.2896, longitude: 103.8173 },
  'Bukit Merah': { latitude: 1.2819, longitude: 103.8239 },
  'Queenstown': { latitude: 1.2942, longitude: 103.7861 },
  'Ang Mo Kio': { latitude: 1.3691, longitude: 103.8454 },
  'Toa Payoh': { latitude: 1.3340, longitude: 103.8563 },
  'MacPherson': { latitude: 1.3262, longitude: 103.8854 },
  'Geylang East': { latitude: 1.3236, longitude: 103.8916 },
  'Bedok': { latitude: 1.3236, longitude: 103.9273 },
  'Tampines': { latitude: 1.3546, longitude: 103.9437 },
  'Pasir Ris': { latitude: 1.3721, longitude: 103.9493 },
  'Bukit Panjang': { latitude: 1.3774, longitude: 103.7640 },
  'Hougang': { latitude: 1.3719, longitude: 103.8930 },
  'Jurong West': { latitude: 1.3404, longitude: 103.7090 },
  'Yishun': { latitude: 1.4304, longitude: 103.8354 },
  'Woodlands': { latitude: 1.4382, longitude: 103.7890 },
  'Clementi': { latitude: 1.3162, longitude: 103.7649 },
  'Boon Lay': { latitude: 1.3046, longitude: 103.7075 },
  'Kreta Ayer': { latitude: 1.2819, longitude: 103.8414 },
  'Kallang Basin': { latitude: 1.3075, longitude: 103.8718 },
  'Singapore': { latitude: 1.3521, longitude: 103.8198 }, // Default center of Singapore
};

// Helper function to find estate for a block number
const findEstateForBlock = (blockNum: number): string => {
  for (const [range, estate] of Object.entries(estateMap)) {
    const [start, end] = range.split('-').map(Number);
    if (blockNum >= start && blockNum <= end) {
      return estate;
    }
  }
  return 'Singapore';
};

// NEW: Function to calculate distance between two points using the Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

// Main ParkSMART Component
const ParkSMART: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedSearchQuery, setDisplayedSearchQuery] = useState<string>("");
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [parkingLocations, setParkingLocations] = useState<CarparkData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<CarparkData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentSort, setCurrentSort] = useState<string>(""); // State for current sort method
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null); // NEW: User's location
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false); // NEW: Loading state for geolocation

  // Helper function to generate detailed location-based names
  const generateLocationName = (carpark: any): string => {
    // First check if we have a predefined name in our mapping
    if (carparkLocationMap[carpark.id]) {
      return carparkLocationMap[carpark.id];
    }
    
    // If the carpark has a name from the API, use it
    if (carpark.name) {
      return carpark.name;
    }
    
    // If we have area info from the API, use it
    if (carpark.area && carpark.area !== 'Unknown') {
      // If it's a pure numeric ID, it's likely a block number
      if (/^\d+$/.test(carpark.id)) {
        return `${carpark.area} Block ${carpark.id}`;
      }
      return `${carpark.area} Carpark ${carpark.id}`;
    }
    
    // For pure numeric IDs, treat as block numbers
    if (/^\d+$/.test(carpark.id)) {
      const blockNum = parseInt(carpark.id);
      const estate = findEstateForBlock(blockNum);
      return `${estate} Block ${carpark.id}`;
    }
    
    // For other IDs, use the agency and ID
    return `${carpark.agency} Carpark ${carpark.id}`;
  };

  // NEW: Function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      // Use your existing areaCoordinates map
      const fallbackLocation = {
        latitude: areaCoordinates['Singapore'].latitude,
        longitude: areaCoordinates['Singapore'].longitude
      };
      setUserLocation(fallbackLocation);
      return;
    }
    
    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log('Got user location:', userCoords);
        setUserLocation(userCoords);
        setIsGettingLocation(false);
        
        // Now fetch data with the new location
        fetchCarparkData();
      },
      (error) => {
        console.error('Error getting user location:', error);
        setIsGettingLocation(false);
        
        // Use Singapore center as fallback
        const fallbackLocation = {
          latitude: areaCoordinates['Singapore'].latitude,
          longitude: areaCoordinates['Singapore'].longitude
        };
        setUserLocation(fallbackLocation);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };

  // NEW: Function to update locations with distance from user
  const updateLocationsWithDistance = (locations: CarparkData[], userCoords: Coordinates) => {
    const locationsWithDistance = locations.map(location => {
      // Get coordinates for the location's area, or use default Singapore coordinates
      const areaCoords = areaCoordinates[location.Area] || areaCoordinates['Singapore'];
      
      // Calculate distance
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        areaCoords.latitude,
        areaCoords.longitude
      );
      
      return {
        ...location,
        latitude: areaCoords.latitude,
        longitude: areaCoords.longitude,
        distance: parseFloat(distance.toFixed(2))
      };
    });
    
    setParkingLocations(locationsWithDistance);
    
    // Also update filtered locations if they exist
    if (filteredLocations.length > 0) {
      const filteredWithDistance = locationsWithDistance.filter(loc => 
        filteredLocations.some(filtered => filtered.id === loc.id)
      );
      setFilteredLocations(filteredWithDistance);
    } else {
      setFilteredLocations(locationsWithDistance);
    }
  };

  // Fetch carpark data from API - UPDATED to include user location
  const fetchCarparkData = async () => {
    setIsLoading(true);
    try {
      let response;
      // Include user location in API request if available
      if (userLocation) {
        response = await fetch(
          `/api/carparks?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`
        );
      } else {
        response = await fetch('/api/carparks');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch carpark data');
      }
      const data = await response.json();
      
      // Add this debug line right here
      console.log("Sample carpark data from API:", data.carparks.slice(0, 3));
      
      // Filter for only car lots (type "C") and transform data for display
      const formattedData = data.carparks
        .filter((carpark: any) => carpark.lotType === 'C')
        .map((carpark: any) => {
          // Determine availability color based on lots available
          const availableLots = parseInt(carpark.availableLots) || 0;
          const availabilityColor = 
            availableLots > 10 ? 'text-green-600' : 
            availableLots > 3 ? 'text-yellow-600' : 
            'text-red-600';
          
          // Generate a detailed display name
          const displayName = carpark.address || carpark.name || generateLocationName(carpark);
          
          // Get area from carpark data or derive from ID
          let area = carpark.area;
          if (!area || area === 'Unknown') {
            if (/^\d+$/.test(carpark.id)) {
              area = findEstateForBlock(parseInt(carpark.id));
            } else if (carpark.agency === 'HDB') {
              area = 'HDB Estate';
            } else if (carpark.agency === 'URA') {
              area = 'Urban Area';
            } else if (carpark.agency === 'LTA') {
              area = 'Transport Area';
            }
          }
          
          // Use coordinates from API if available, otherwise use area coordinates
          let latitude = carpark.coordinates?.lat;
          let longitude = carpark.coordinates?.lng;
          
          if (!latitude || !longitude) {
            const areaCoords = areaCoordinates[area] || areaCoordinates['Singapore'];
            latitude = areaCoords.latitude;
            longitude = areaCoords.longitude;
          }
          
          // Use distance from API if available
          let distance = carpark.distance;

          // Make sure distance is a number, not a string or undefined
          if (typeof distance !== 'undefined') {
            distance = parseFloat(distance);
            
            // If distance is NaN or 0, calculate it
            if (isNaN(distance) || distance === 0) {
              if (userLocation && latitude && longitude) {
                distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  latitude,
                  longitude
                );
                distance = parseFloat(distance.toFixed(2));
              }
            }
          }
          
          // Add pricing information from API
          const pricingData = carpark.pricing || {
            weekday: { morning: '0.60', afternoon: '1.20', evening: '0.60' },
            weekend: { morning: '0.60', afternoon: '0.60', evening: '0.60' }
          };
            
          return {
            id: carpark.id,
            Development: displayName,
            Area: area,
            AvailableLots: availableLots.toString(),
            LotType: 'Cars',
            Agency: carpark.agency,
            availabilityColor,
            latitude,
            longitude,
            distance,
            // Add pricing data
            pricing: pricingData,
            // Add CSV data fields if available (especially for HDB carparks)
            address: carpark.address,
            carParkType: carpark.carParkType,
            typeOfParkingSystem: carpark.typeOfParkingSystem,
            shortTermParking: carpark.shortTermParking,
            freeParking: carpark.freeParking,
            nightParking: carpark.nightParking,
            carParkDecks: carpark.carParkDecks,
            gantryHeight: carpark.gantryHeight,
            carParkBasement: carpark.carParkBasement
          };
        });
      
      setParkingLocations(formattedData);
      setFilteredLocations(formattedData);
      
      // Apply current sort if one is active
      if (currentSort) {
        sortLocations(formattedData, currentSort, userLocation);
      }
    } catch (error) {
      console.error('Error fetching carpark data:', error);
      setParkingLocations([]);
      setFilteredLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to filter parking locations based on search query
  const filterParkingLocations = () => {
    if (!searchQuery.trim()) {
      // If search query is empty, show all locations
      setFilteredLocations(parkingLocations);
      setDisplayedSearchQuery(""); // Clear the displayed search query
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    // Filter locations based on Development name or Area containing the search query
    const filtered = parkingLocations.filter(
      location => 
        location.Development.toLowerCase().includes(query) || 
        location.Area.toLowerCase().includes(query) ||
        (location.Agency && location.Agency.toLowerCase().includes(query))
    );
    
    setFilteredLocations(filtered);
    setDisplayedSearchQuery(searchQuery);
    
    // Apply current sort to filtered results if one is active
    if (currentSort) {
      sortLocations(filtered, currentSort, userLocation);
    }
  };

  // Function to sort locations based on sort method
  const sortLocations = (
    locations: CarparkData[], 
    sortBy: string, 
    userCoords: Coordinates | null = userLocation
  ) => {
    let sortedLocations = [...locations];
    
    switch (sortBy) {
      case 'alphabetical':
        sortedLocations.sort((a, b) => a.Development.localeCompare(b.Development));
        break;
      case 'price-low':
        // Placeholder for price sorting
        console.log('Price sorting not implemented yet - need price data');
        break;
      case 'price-high':
        // Placeholder for price sorting
        console.log('Price sorting not implemented yet - need price data');
        break;
      case 'availability':
        // Sort by number of available lots (highest first)
        sortedLocations.sort((a, b) => 
          parseInt(b.AvailableLots) - parseInt(a.AvailableLots)
        );
        break;
      case 'distance':
        // Sort by distance (closest first) if user location is available
        if (userCoords) {
          // Make sure all locations have distance calculated
          sortedLocations = sortedLocations.map(loc => {
            if (loc.distance === undefined) {
              const areaCoords = areaCoordinates[loc.Area] || areaCoordinates['Singapore'];
              const distance = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                areaCoords.latitude,
                areaCoords.longitude
              );
              return {
                ...loc,
                distance: parseFloat(distance.toFixed(2))
              };
            }
            return loc;
          });
          
          // Sort by distance
          sortedLocations.sort((a, b) => {
            const distA = a.distance || Infinity;
            const distB = b.distance || Infinity;
            return distA - distB;
          });
        } else {
          // If user location is not available, prompt to get it
          getUserLocation();
        }
        break;
      default:
        // No sorting
        break;
    }
    
    setFilteredLocations(sortedLocations);
  };

  // Handler for sort dropdown selection
  const handleSort = (sortBy: string) => {
    setCurrentSort(sortBy);
    
    // For distance sorting, ensure we have user location
    if (sortBy === 'distance' && !userLocation) {
      getUserLocation();
    }
    
    sortLocations(filteredLocations, sortBy);
  };

  // First get user location, then fetch carpark data
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch data when location is available or changes
  useEffect(() => {
    if (userLocation) {
      fetchCarparkData();
    }
  }, [userLocation]);

  // Handle navigation to car-park-details page
  const handleViewDetails = (parking: CarparkData) => {
    router.push({
      pathname: '/car-park-details',
      query: { 
        id: parking.id || parking.Development.replace(/\s+/g, '-').toLowerCase(),
        name: parking.Development,
        area: parking.Area,
        lots: parking.AvailableLots,
        type: parking.LotType,
        agency: parking.Agency,
        // Add pricing data as a JSON string
        pricingData: JSON.stringify(parking.pricing || {})
      }
    });
  };

  // Handle refresh button click - now also updates location
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // First get the updated location, then fetch carpark data
    getUserLocation();
    
    // The fetchCarparkData will be triggered by the useEffect watching userLocation
    setTimeout(() => {
      setIsRefreshing(false);
      if (displayedSearchQuery) {
        filterParkingLocations();
      }
    }, 3000); // Give enough time for location and data fetch
  };

  return (
    <Navigation>
      <div className="flex min-h-screen flex-col">
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          evCharging={evCharging}
          setEvCharging={setEvCharging}
          shelteredCarpark={shelteredCarpark}
          setShelteredCarpark={setShelteredCarpark}
          onSearch={filterParkingLocations}
          onSort={handleSort}
          currentSort={currentSort}
          onGetLocation={getUserLocation} // NEW: Function to get user location
          isGettingLocation={isGettingLocation} // NEW: Loading state for location
        />

        <MapView />

        <main className="flex-grow bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white">
              {displayedSearchQuery ? (
                <>Showing results for "{displayedSearchQuery}" <span className="text-base font-normal ml-2">({filteredLocations.length} carparks found)</span></>
              ) : (
                <>All Carparks <span className="text-base font-normal ml-2">({filteredLocations.length} carparks)</span></>
              )}
            </h2>
            
            <div>
              {/* Refresh Button - Now also updates location */}
              <Button 
                size="sm"
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing || isGettingLocation}
                className="flex items-center gap-1 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                <span>
                  {isRefreshing ? 'Refreshing...' : 
                   isGettingLocation ? 'Getting location...' : 
                   'Refresh'}
                </span>
              </Button>
            </div>
          </div>

          {isLoading && !isRefreshing ? (
            <div className="flex justify-center p-12">
              <p className="text-lg dark:text-white">Loading carpark data...</p>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="flex justify-center flex-col items-center p-12">
              <p className="text-lg dark:text-white mb-4">
                {searchQuery ? `No car parking lots found matching "${searchQuery}"` : "No car parking lots available"}
              </p>
              {searchQuery && (
                <Button 
                  onClick={() => { setSearchQuery(''); setFilteredLocations(parkingLocations); }}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLocations.map((parking, index) => (
                <Card
                  key={`${parking.Agency}-${parking.id}-${index}`}
                  className="overflow-hidden border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                >
                  <CardContent className="p-6 dark:text-white">
                    <h3 className="mb-2 text-xl font-bold">{parking.Development}</h3>
                    <p>
                      <span className="font-medium">Area:</span>{" "}
                      {parking.Area}
                    </p>
                    <p>
                      <span className="font-medium">Availability:</span>{" "}
                      <span className={parking.availabilityColor}>
                        {parking.AvailableLots}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Agency:</span>{" "}
                      {parking.Agency}
                    </p>
                    {/* Show distance if available */}
                    {parking.distance !== undefined && (
                      <p>
                        <span className="font-medium">Distance:</span>{" "}
                        <span className="text-blue-600">{parking.distance} km</span>
                      </p>
                    )}
                    {/* Show additional information for HDB carparks */}
                    {parking.Agency === 'HDB' && parking.freeParking && (
                      <p>
                        <span className="font-medium">Free Parking:</span>{" "}
                        {parking.freeParking}
                      </p>
                    )}
                    {parking.Agency === 'HDB' && parking.nightParking && (
                      <p>
                        <span className="font-medium">Night Parking:</span>{" "}
                        {parking.nightParking}
                      </p>
                    )}
                    <Button 
                      className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => handleViewDetails(parking)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </Navigation>
  );
};

export default ParkSMART;