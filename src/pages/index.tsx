import React, { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { TopBar } from "~/components/global/top-bar-home";
import { Navigation } from "~/components/global/navigation";
import MapView from "~/components/map/map-view";
import { useRouter } from "next/router";
import { RefreshCw } from "lucide-react";

interface ParkingLocation {
  name: string;
  location: string;
  price: string;
  availability: string;
  availabilityColor: string;
}

interface CarparkData {
  Development: string;
  Area: string;
  AvailableLots: string;
  LotType: string;
  Agency: string;
  availabilityColor: string;
  id?: string;
}

// Mapping of HDB block ranges to areas in Singapore
const estateMap: Record<string, string> = {
  '1-50': 'Tiong Bahru',
  '51-82': 'Commonwealth',
  '83-95': 'Redhill',
  '96-116': 'Bukit Merah',
  '117-131': 'Queenstown',
  '132-162': 'Queenstown',
  '163-227': 'Bukit Merah',
  '230-235': 'Tiong Bahru',
  '236-315': 'Tiong Bahru',
  '316-329': 'Queenstown',
  '330-357': 'Bukit Merah',
  '401-409': 'Ang Mo Kio',
  '410-428': 'Toa Payoh',
  '435-458': 'MacPherson',
  '462-468': 'Geylang East',
  '469-470': 'Geylang East',
  '471-473': 'MacPherson',
  '474-476': 'Bedok',
  '477-486': 'Tampines',
  '487-500': 'Bedok',
  '501-507': 'Bedok',
  '508-511': 'Bedok',
  '512-565': 'Bedok',
  '566-586': 'Pasir Ris',
  '587-595': 'Pasir Ris',
  '596-598': 'Pasir Ris',
  '601-612': 'Ang Mo Kio',
  '613-631': 'Bukit Panjang',
  '632-639': 'Bukit Panjang',
  '640-645': 'Bukit Panjang',
  '646-649': 'Hougang',
  '650-697': 'Jurong West',
  '701-711': 'Yishun',
  '712-716': 'Woodlands',
  '717-732': 'Clementi',
  '733-742': 'Toa Payoh',
  '743-746': 'Boon Lay',
  '747-751': 'Pasir Ris',
  '752-761': 'Tampines',
  '762-765': 'Tampines',
  '766-769': 'Tampines',
  '770-773': 'Tampines',
  '774-781': 'Tampines',
  '782-787': 'Tampines',
  '801-811': 'Kreta Ayer',
  '812-824': 'Kreta Ayer',
  '825-829': 'Queenstown',
  '830-833': 'Kallang Basin',
  '834-857': 'Geylang East',
  '858-861': 'Geylang East',
  '862-866': 'Geylang East',
  '867-876': 'Tampines',
  '877-882': 'Tampines',
  '883-888': 'Tampines',
  '889-899': 'Tampines',
  '901-913': 'Kallang Basin',
  '914-918': 'Kallang Basin',
  '919-933': 'Hougang',
  '934-956': 'Hougang',
  '957-962': 'Hougang',
  '963-966': 'Bukit Panjang',
};

// Specific locations for known carparks
const carparkLocationMap: Record<string, string> = {
  // Specific block mappings
  '37': 'Holland Drive Block 37',
  '50': 'Commonwealth Drive Block 50',
  '51': 'Commonwealth Drive Block 51',
  '43': 'Holland Drive Block 43',
  '15': 'Dover Road Block 15',
  '16': 'Dover Road Block 16',
  '17': 'Dover Crescent Block 17',
  '18': 'Dover Crescent Block 18',
  '9': 'Queen\'s Road Block 9',
  
  // More specific HDB carparks
  'HE12': 'Woodlands Central',
  'HLM': 'Hougang Ave 10',
  'RHM': 'Redhill Market',
  'BM29': 'Bukit Merah Central',
  'Q81': 'Queenstown Blk 81',
  'C20': 'Clementi West Street 2',
  'FR3M': 'Farrer Road Market',
  'C32': 'Chinatown Complex',
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

// Main ParkSMART Component
const ParkSMART: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayedSearchQuery, setDisplayedSearchQuery] = useState<string>(""); // Add this state to track displayed search query
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [parkingLocations, setParkingLocations] = useState<CarparkData[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<CarparkData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // Fetch carpark data from API
  const fetchCarparkData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/carparks');
      if (!response.ok) {
        throw new Error('Failed to fetch carpark data');
      }
      const data = await response.json();
      
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
          const displayName = carpark.name || generateLocationName(carpark);
          
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
            
          return {
            id: carpark.id,
            Development: displayName,
            Area: area,
            AvailableLots: availableLots.toString(),
            LotType: 'Cars', // Changed from showing code to human-readable text
            Agency: carpark.agency,
            availabilityColor
          };
        });
      
      setParkingLocations(formattedData);
      setFilteredLocations(formattedData); // Initialize filtered locations with all locations
    } catch (error) {
      console.error('Error fetching carpark data:', error);
      // Fallback to empty array if fetching fails
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
    setDisplayedSearchQuery(searchQuery); // Update the displayed search query only after search button is clicked
  };

  // Initial data fetch
  useEffect(() => {
    fetchCarparkData();
  }, []);

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
        agency: parking.Agency
      }
    });
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCarparkData().finally(() => {
      setIsRefreshing(false);
      // Reset search results when refreshing
      if (displayedSearchQuery) {
        filterParkingLocations();
      }
    });
  };

  return (
    <Navigation>
      {/* Top Navigation Bar */}
      <div className="flex min-h-screen flex-col">
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          evCharging={evCharging}
          setEvCharging={setEvCharging}
          shelteredCarpark={shelteredCarpark}
          setShelteredCarpark={setShelteredCarpark}
          onSearch={filterParkingLocations} // Pass the search function
        />

        {/* Map */}
        <MapView />

        {/* Results Area */}
        <main className="flex-grow bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white">
              {displayedSearchQuery ? (
                <>Showing results for "{displayedSearchQuery}" <span className="text-base font-normal ml-2">({filteredLocations.length} carparks found)</span></>
              ) : (
                <>All Carparks <span className="text-base font-normal ml-2">({filteredLocations.length} carparks)</span></>
              )}
            </h2>
            
            {/* Refresh Button */}
            <Button 
              size="sm"
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <RefreshCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
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
                        {parking.AvailableLots} {/* Removed (C) indicator */}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Agency:</span>{" "}
                      {parking.Agency}
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