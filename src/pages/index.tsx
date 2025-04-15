import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card"; // Added CardFooter
import { TopBar } from "~/components/global/top-bar-home";
import { Navigation } from "~/components/global/navigation";
import MapView from "~/components/map/map-view";
import { RefreshCw } from "lucide-react"; // Removed Heart icon as we're using FavouriteButton
import { api, RouterOutputs } from "~/utils/api"; // Import tRPC API
import HDBMapView from "~/components/map/hdb-map-view";
import MapViewUpdated from "~/components/map/map-view2";
import { getDistance } from "geolib"; // calculate distance bw 2 points
import { useRouter } from "next/router"; // Import Next.js router
import { FavouriteButton } from "../components/global/favourite-button"; // Import the FavouriteButton component
import getAvailabilityColour from "~/utils/get-availability-colour";
import getDistanceBetweenCarPark from "~/utils/get-distance-between-carpark";
import { toast } from "sonner";
import TestMap from "~/components/map/test-map";

// Updated interface for carpark data to match schema
type CarparkData = RouterOutputs["carPark"]["getCarparks"][number]
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
  const [displayLimit, setDisplayLimit] = useState<number>(24);
  const [allFilteredCarparks, setAllFilteredCarparks] = useState<CarparkData[]>([]);

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
  } = api.carPark.getCarparks.useQuery({
    x: currentLocation?.lng ?? 0,
    y: currentLocation?.lat ?? 0
  });

  const refreshMutation = api.carPark.refreshAvailability.useMutation();

  // Filter carparks based on search and sheltered criteria
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

      // Always sort by distance first to get closest carparks
      filtered.sort((a, b) => {
        const distanceA = parseFloat(getDistanceBetweenCarPark(a.location)) || 9999;
        const distanceB = parseFloat(getDistanceBetweenCarPark(b.location)) || 9999;
        return distanceA - distanceB;
      });

      // Store all filtered results
      setAllFilteredCarparks(filtered);
      
      // Get display set based on limit
      const displaySet = filtered.slice(0, displayLimit);
      
      // Apply other sorts only if not distance
      if (currentSort && currentSort !== "distance") {
        applySort(displaySet, currentSort);
      }
      
      setFilteredParkingLocations(displaySet);
    }
  }, [carparks, shelteredCarpark, displayedSearchQuery, displayLimit]);

  // Apply sort only to displayed carparks
  useEffect(() => {
    if (allFilteredCarparks.length > 0) {
      // Take current display set
      const displaySet = allFilteredCarparks.slice(0, displayLimit);
      
      if (currentSort === "distance") {
        // For distance, we just take from the already distance-sorted allFilteredCarparks
        setFilteredParkingLocations(displaySet);
      } else if (currentSort) {
        // For other sorts, apply sort to the current display set
        const sortedDisplaySet = [...displaySet];
        applySort(sortedDisplaySet, currentSort);
        setFilteredParkingLocations(sortedDisplaySet);
      }
    }
  }, [currentSort, allFilteredCarparks, displayLimit]);
  
  // Helper function to apply sorts
  const applySort = (carparks: CarparkData[], sortType: string) => {
    switch (sortType) {
      case "availability":
        carparks.sort(
          (a, b) =>
            (Number(b.availableLots) || 0) - (Number(a.availableLots) || 0),
        );
        break;
      case "alphabetical":
        carparks.sort((a, b) => a.address.localeCompare(b.address));
        break;
      default:
        break;
    }
  };

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

  // Get user location and sort by distance
  const getUserLocation = () => {
    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        // Sort by distance
        setCurrentSort("distance");
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);
      }
    );
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
        name: parking.address,
        carParkType: parking.carParkType,
        typeOfParkingSystem: parking.typeOfParkingSystem,
        availableLots: parking.availableLots,
        pricing: JSON.stringify(samplePricingData),
        carParkNo: parking.carParkNo,
        isFavorite: false,
        locationX: parking.location.x.toString(),
        locationY: parking.location.y.toString()
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setDisplayedSearchQuery("");
    setShelteredCarpark(false);
    setDisplayLimit(24);
  };

  // Handle loading more carparks
  const handleLoadMore = () => {
    const newLimit = displayLimit + 24;
    if (newLimit >= allFilteredCarparks.length) {
      // No more carparks to show
      toast.info("No more carparks to display");
    }
    setDisplayLimit(newLimit);
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

        {/* Display map with all carpark markers */}
        {/* <MapViewUpdated carparks_data={filteredParkingLocations} /> */}
        <TestMap carparks_data={filteredParkingLocations} />

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
      className="overflow-hidden border border-gray-200 dark:border-gray-600 dark:bg-gray-700 flex flex-col"
    >
      <CardContent className="p-6 dark:text-white flex-grow">
        <h3 className="mb-2 text-xl font-bold">{parking.address}</h3>
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
          <span className={getAvailabilityColour(parking.availableLots)}>
            {parking.availableLots}
          </span>
        </p>
        <p>
          <span className="font-medium">Pricing:</span>{" "}
          {(() => {
            const central_area = ["ACB", "BBB", "BRBI", "CY", "DUXM", "HLM", "KAB", "KAM", "KAS", "PRM", "SLS", "SR1", "SR2", "TPM", "UCS", "WCB"];
            const peak_hour = ["ACB", "CY", "SE21", "SE22", "SE24", "MP14", "MP15", "MP16", "HG9", "HG9T", "HG15", "HG16"];
            const lub = ["GSML", "BRBL", "JCML", "T55", "GEML", "KAML", "J57L", "J60L", "TPL", "EPL", "BL8L"];
            
            if (lub.includes(parking.carParkNo)) {
              return "$2-$4/30min";
            } else if (peak_hour.includes(parking.carParkNo)) {
              return "$0.60-$1.20/ 30min";
            } else if (central_area.includes(parking.carParkNo)) {
              return "$0.60-$1.20/30min";
            } else {
              return "$0.60/30min";
            }
          })()}
        </p>
        <p>
          <span className="font-medium">Distance:</span>{" "}
          <span className="text-blue-600">
            {getDistanceBetweenCarPark(parking.location)} km
          </span>
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 mt-auto">
        <div className="flex justify-end space-x-2 w-full">
          <Button 
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => handleViewDetails(parking)}
          >
            View Details
          </Button>
          <FavouriteButton 
            carParkId={parking.id}
            isFavourited={parking.isFavourited}
          />
        </div>
      </CardFooter>
    </Card>
  ))}
</div>
          )}
          
          {/* View More Carparks button */}
          {filteredParkingLocations.length > 0 && filteredParkingLocations.length < allFilteredCarparks.length && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLoadMore}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                View More Carparks
              </Button>
            </div>
          )}
        </main>
      </div>
    </Navigation>
  );
};

export default ParkSMART;
