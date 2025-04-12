import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card"; // Added CardFooter
import { TopBar } from "~/components/global/top-bar-home";
import { Navigation } from "~/components/global/navigation";
import MapView from "~/components/map/map-view";
import { RefreshCw } from "lucide-react"; // Removed Heart icon as we're using FavouriteButton
import { api } from "~/utils/api"; // Import tRPC API
import HDBMapView from "~/components/map/hdb-map-view";
import MapViewUpdated from "~/components/map/map-view2";
import { getDistance } from "geolib"; // calculate distance bw 2 points
import { useRouter } from "next/router"; // Import Next.js router
import { FavouriteButton } from "../components/global/favourite-button"; // Import the FavouriteButton component

// Updated interface for carpark data to match schema
interface CarparkData {
  id: string;
  name: string;
  carParkType: string;
  typeOfParkingSystem: string;
  availableLots: string;
  pricing?: string;
  availabilityColor: string;
  carParkNo?: string;
  isFavorite?: boolean; // Added to track favorite status
  location: [number, number];
  distance: number;
  lat: number;
  lng: number;
}

interface Position {
  lat: number;
  lng: number;
}

// Main ParkSMART Component
const ParkSMART: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedSearchQuery, setDisplayedSearchQuery] = useState<string>("");
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [currentSort, setCurrentSort] = useState<string>("");
  const [filteredParkingLocations, setFilteredParkingLocations] = useState<
    CarparkData[]
  >([]);
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);

  // get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      setCurrentLocation(location);
    });
  });

  // Use tRPC to fetch carpark data
  const {
    data: carparks,
    isLoading,
    refetch,
  } = api.carPark.getCarparks.useQuery();

  // Use tRPC to refresh carpark availability data
  const refreshMutation = api.carPark.refreshAvailability.useMutation();

  // Fixed distances for consistency between server and client
  const mockDistances = ["2.45", "3.78", "1.23"];

  // Unified filtering logic in a single useEffect
  useEffect(() => {
    if (carparks) {
      let filtered = [...carparks];

      // Apply search filter if query exists
      if (displayedSearchQuery) {
        filtered = filtered.filter(
          (carpark) =>
            carpark.address
              .toLowerCase()
              .includes(displayedSearchQuery.toLowerCase()) ||
            carpark.carParkType
              .toLowerCase()
              .includes(displayedSearchQuery.toLowerCase()),
        );
      }

      // Apply sheltered filter if checked
      if (shelteredCarpark) {
        filtered = filtered.filter(
          (carpark) =>
            carpark.carParkType.toLowerCase().includes("multi-storey") ||
            carpark.carParkType.toLowerCase().includes("basement"),
        );
      }

      // Apply sorting if a sort method is selected
      if (currentSort) {
        switch (currentSort) {
          case "availability":
            filtered.sort(
              (a, b) =>
                (Number(b.availableLots) || 0) - (Number(a.availableLots) || 0),
            );
            break;
          case "alphabetical":
            filtered.sort((a, b) => a.address.localeCompare(b.address));
            break;
          case "distance":
            // This would be implemented with actual distance data
            // For now, we'll keep the existing order
            break;
          default:
            break;
        }
      }

      // Map the filtered data to the display format
      const mappedData = filtered.map((carpark) => {
        const availableLots = Number(carpark.availableLots) || 0;
        let availabilityColor = "text-green-600";
        if (availableLots <= 5) availabilityColor = "text-yellow-600";
        if (availableLots <= 2) availabilityColor = "text-red-600";

        let distance = 0;
        console.log('current location:', currentLocation)
        if (currentLocation) {
          distance = getDistance(
            {
              latitude: currentLocation?.lat,
              longitude: currentLocation?.lng,
            },
            { latitude: carpark.location[1], longitude: carpark.location[0] },
          );
        }

        distance = distance / 1000;  // convert m to km

        return {
          id: carpark.id,
          name: carpark.address,
          carParkType: carpark.carParkType,
          typeOfParkingSystem: carpark.typeOfParkingSystem,
          availableLots: availableLots.toString(),
          pricing: "Varies",
          availabilityColor,
          carParkNo: carpark.carParkNo,
          isFavorite: false, // Default value for favorite status,
          location: carpark.location,
          distance: distance.toFixed(2),
          lat: carpark.location[1],
          lng: carpark.location[0],
        };
      });

      setFilteredParkingLocations(mappedData);
    }
  }, [carparks, shelteredCarpark, displayedSearchQuery, currentSort]);

  // Handle search submission
  const handleSearch = () => {
    setDisplayedSearchQuery(searchQuery);
  };

  // Handle sort selection
  const handleSort = (sortBy: string) => {
    setCurrentSort(sortBy);
  };

  // Refresh carpark data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMutation.mutateAsync();
      await refetch();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Simulate location getting
  const getUserLocation = () => {
    setIsGettingLocation(true);
    setTimeout(() => {
      setIsGettingLocation(false);
      // In a real app, we would use the browser's geolocation API
      // and then sort carparks by distance from user
    }, 1500);
  };

  // View details handler - navigate to car-park-details page with full parking details
  const handleViewDetails = (parking: CarparkData) => {
    // Create a sample pricing data to demonstrate dynamic pricing
    // In a real app, this would come from your API
    const samplePricingData = {
      weekday: {
        morning: "0.60",
        afternoon: "1.20",
        evening: "0.60"
      },
      weekend: {
        morning: "1.20",
        afternoon: "1.50",
        evening: "0.60"
      }
    };
    
    // Fix: Handle the Promise returned by router.push
    void router.push({
      pathname: '/car-park-details',
      query: { 
        id: parking.id,
        name: parking.name,
        carParkType: parking.carParkType,
        typeOfParkingSystem: parking.typeOfParkingSystem,
        availableLots: parking.availableLots,
        availabilityColor: parking.availabilityColor,
        pricing: JSON.stringify(samplePricingData),
        carParkNo: parking.carParkNo,
        isFavorite: parking.isFavorite ? "true" : "false"
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setDisplayedSearchQuery("");
    setShelteredCarpark(false);
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
          onSearch={handleSearch}
          onSort={handleSort}
          currentSort={currentSort}
          onGetLocation={getUserLocation}
          isGettingLocation={isGettingLocation}
        />

        {/* <MapView /> */}
        {/* <HDBMapView carparks={filteredParkingLocations.slice(0, 20)}/> */}
        <MapViewUpdated carparks_data={filteredParkingLocations} />
        {/* <MapViewUpdated carparks_data={filteredParkingLocations.slice(0, 200)}/> */}

        <main className="flex-grow bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white">
              {displayedSearchQuery ? (
                <>
                  Showing results for &quot;{displayedSearchQuery}&quot;{" "}
                  <span className="ml-2 text-base font-normal">
                    ({filteredParkingLocations.length} carparks found)
                  </span>
                </>
              ) : (
                <>
                  All Carparks{" "}
                  <span className="ml-2 text-base font-normal">
                    ({filteredParkingLocations.length} carparks)
                  </span>
                </>
              )}
            </h2>

            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={
                  isRefreshing || isGettingLocation || refreshMutation.isLoading
                }
                className="flex items-center gap-1 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <RefreshCw
                  size={16}
                  className={`${isRefreshing || refreshMutation.isLoading ? "animate-spin" : ""}`}
                />
                <span>
                  {isRefreshing || refreshMutation.isLoading
                    ? "Refreshing..."
                    : isGettingLocation
                      ? "Getting location..."
                      : "Refresh"}
                </span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <p className="text-lg dark:text-white">Loading carpark data...</p>
            </div>
          ) : filteredParkingLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <p className="mb-4 text-lg dark:text-white">
                {searchQuery || shelteredCarpark
                  ? `No car parking lots found matching your criteria`
                  : "No car parking lots available"}
              </p>
              {(searchQuery || shelteredCarpark) && (
                <Button
                  onClick={resetFilters}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredParkingLocations.map((parking, index) => (
                <Card
                  key={`${parking.id}-${index}`}
                  className="overflow-hidden border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                >
                  <CardContent className="p-6 dark:text-white">
                    <h3 className="mb-2 text-xl font-bold">{parking.name}</h3>
                    <p>
                      <span className="font-medium">Carpark Type:</span>{" "}
                      {parking.carParkType}
                    </p>
                    <p>
                      <span className="font-medium">Parking System:</span>{" "}
                      {parking.typeOfParkingSystem}
                    </p>
                    <p>
                      <span className="font-medium">Availability:</span>{" "}
                      <span className={parking.availabilityColor}>
                        {parking.availableLots}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Pricing:</span>{" "}
                      {parking.pricing}
                    </p>
                    {/* Display a fixed mock distance for UI purposes */}
                    <p>
                      <span className="font-medium">Distance:</span>{" "}
                      <span className="text-blue-600">
                        {mockDistances[index % mockDistances.length]} km
                      </span>
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => handleViewDetails(parking)}
                      >
                        View Details
                      </Button>
                      {/* Replaced the "Add to Favourites" button with FavouriteButton component */}
                      <FavouriteButton 
                        carParkId={parking.id}
                        isFavourited={!!parking.isFavorite}
                      />
                    </div>
                  </CardFooter>
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
