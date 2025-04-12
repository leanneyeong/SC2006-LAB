import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { TopBar } from "~/components/global/top-bar-home";
import { Navigation } from "~/components/global/navigation";
import MapView from "~/components/map/map-view";
import { RefreshCw } from "lucide-react";
import { api } from "~/utils/api"; // Import tRPC API

// Updated interface for carpark data to match schema
interface CarparkData {
  id: string;
  name: string; // Now using address as name
  carParkType: string;
  typeOfParkingSystem: string;
  availableLots: string;
  pricing?: string; // Optional pricing information
  availabilityColor: string;
  carParkNo?: string;
}

// Main ParkSMART Component
const ParkSMART: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedSearchQuery, setDisplayedSearchQuery] = useState<string>("");
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [currentSort, setCurrentSort] = useState<string>("");
  const [filteredParkingLocations, setFilteredParkingLocations] = useState<CarparkData[]>([]);
  
  // Use tRPC to fetch carpark data
  const { data: carparks, isLoading, refetch } = api.carPark.getCarparks.useQuery();
  
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
        filtered = filtered.filter(carpark => 
          carpark.address.toLowerCase().includes(displayedSearchQuery.toLowerCase()) ||
          carpark.carParkType.toLowerCase().includes(displayedSearchQuery.toLowerCase())
        );
      }
      
      // Apply sheltered filter if checked
      if (shelteredCarpark) {
        filtered = filtered.filter(carpark => 
          carpark.carParkType.toLowerCase().includes("multi-storey") || 
          carpark.carParkType.toLowerCase().includes("basement")
        );
      }
      
      // Apply sorting if a sort method is selected
      if (currentSort) {
        switch (currentSort) {
          case "availability":
            filtered.sort((a, b) => (Number(b.availableLots) || 0) - (Number(a.availableLots) || 0));
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
      const mappedData = filtered.map(carpark => {
        const availableLots = Number(carpark.availableLots) || 0;
        let availabilityColor = "text-green-600";
        if (availableLots <= 5) availabilityColor = "text-yellow-600";
        if (availableLots <= 2) availabilityColor = "text-red-600";
        
        return {
          id: carpark.id,
          name: carpark.address,
          carParkType: carpark.carParkType,
          typeOfParkingSystem: carpark.typeOfParkingSystem,
          availableLots: availableLots.toString(),
          pricing: "Varies",
          availabilityColor,
          carParkNo: carpark.carParkNo
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

  // View details handler
  const handleViewDetails = (parking: CarparkData) => {
    console.log("View details:", parking.id);
    // In a real implementation, this would navigate to details page
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

        <MapView />

        <main className="flex-grow bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white">
              {displayedSearchQuery ? (
                <>Showing results for &quot;{displayedSearchQuery}&quot; <span className="text-base font-normal ml-2">({filteredParkingLocations.length} carparks found)</span></>
              ) : (
                <>All Carparks <span className="text-base font-normal ml-2">({filteredParkingLocations.length} carparks)</span></>
              )}
            </h2>
            
            <div>
              <Button 
                size="sm"
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing || isGettingLocation || refreshMutation.isLoading}
                className="flex items-center gap-1 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <RefreshCw size={16} className={`${isRefreshing || refreshMutation.isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isRefreshing || refreshMutation.isLoading ? 'Refreshing...' : 
                   isGettingLocation ? 'Getting location...' : 
                   'Refresh'}
                </span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <p className="text-lg dark:text-white">Loading carpark data...</p>
            </div>
          ) : filteredParkingLocations.length === 0 ? (
            <div className="flex justify-center flex-col items-center p-12">
              <p className="text-lg dark:text-white mb-4">
                {searchQuery || shelteredCarpark ? `No car parking lots found matching your criteria` : "No car parking lots available"}
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
                      <span className="text-blue-600">{mockDistances[index % mockDistances.length]} km</span>
                    </p>
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