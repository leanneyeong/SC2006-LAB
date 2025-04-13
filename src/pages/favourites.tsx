import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Navigation } from '~/components/global/navigation';
import { TopBar } from '~/components/global/top-bar-others';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import getAvailabilityColour from '~/utils/get-availability-colour';

interface ParkingLocation {
  id: string;
  name?: string;
  address: string;
  carParkType: string;
  typeOfParkingSystem: string;
  availableLots: number;
  shortTermParking: string;
  freeParking: string;
  nightParking: string;
  availabilityColor: string;
  distance?: number;
}

const ParkSMART: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<ParkingLocation[]>([]);
  
  // Get current user's location
  const [userLocation, setUserLocation] = useState<{x: number, y: number} | null>(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            x: position.coords.longitude,
            y: position.coords.latitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Singapore coordinates
          setUserLocation({ x: 103.8198, y: 1.3521 });
        }
      );
    } else {
      // Default to Singapore coordinates if geolocation is not available
      setUserLocation({ x: 103.8198, y: 1.3521 });
    }
  }, []);

  // Query to get nearby carparks (will include isFavourited flag)
  const carparksQuery = api.carPark.getCarparks.useQuery(
    { x: userLocation?.x ?? 103.8198, y: userLocation?.y ?? 1.3521 }, 
    { enabled: userLocation !== null }
  );

  // Set favorite mutation
  const setFavoriteMutation = api.carPark.setFavourite.useMutation();

  useEffect(() => {
    if (carparksQuery.data) {
      // Filter to only include favorited carparks
      const favoritedCarparks = carparksQuery.data
        .filter(carpark => carpark.isFavourited)
        .map(carpark => ({
          id: carpark.id,
          address: carpark.address,
          carParkType: carpark.carParkType,
          typeOfParkingSystem: carpark.typeOfParkingSystem,
          availableLots: carpark.availableLots,
          shortTermParking: carpark.shortTermParking,
          freeParking: carpark.freeParking,
          nightParking: carpark.nightParking,
          availabilityColor: getAvailabilityColour(carpark.availableLots),
          distance: carpark.distance ? parseFloat((carpark.distance / 1000).toFixed(1)) : undefined // Convert to km
        }));

      setFavorites(favoritedCarparks);
      setLoading(false);
    }
  }, [carparksQuery.data]);

  // Handler functions
  const handleViewDetails = (parking: ParkingLocation) => {
    // Create sample pricing data like in index.tsx
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
    
    // Pass all required parameters to the details page
    void router.push({
      pathname: '/car-park-details',
      query: {
        id: parking.id,
        name: parking.address,
        carParkType: parking.carParkType,
        typeOfParkingSystem: parking.typeOfParkingSystem,
        availableLots: parking.availableLots.toString(),
        availabilityColor: parking.availabilityColor,
        pricing: JSON.stringify(samplePricingData),
        isFavourited: "true",
        locationX: userLocation ? userLocation.x.toString() : "",
        locationY: userLocation ? userLocation.y.toString() : ""
      }
    });
  };

  const handleRemoveFavorite = async (parkingId: string) => {
    try {
      await setFavoriteMutation.mutateAsync({
        id: parkingId,
        isFavourited: false
      });
      
      // Remove from local state
      setFavorites(prev => prev.filter(carpark => carpark.id !== parkingId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <Navigation>
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <TopBar />
        
        {/* Content */}
        <main className="flex-grow bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mx-auto">
            <Card className="mb-6 dark:border-gray-600 dark:bg-gray-700">
              <CardContent className="flex justify-center px-6 py-0.5">
                <h2 className="text-xl font-semibold dark:text-white">Favourited Car Parks</h2>
              </CardContent>
            </Card>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <p>Loading your favorites...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="flex justify-center p-8">
                <p>You haven&apos;t added any favorites yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((parking) => (
                  <Card
                    key={parking.id}
                    className="overflow-hidden border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <CardContent className="p-6 dark:text-white">
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
                        <span className={parking.availabilityColor}>
                          {parking.availableLots} Lots
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Short Term Parking:</span>{" "}
                        {parking.shortTermParking}
                      </p>
                      <p>
                        <span className="font-medium">Free Parking:</span>{" "}
                        {parking.freeParking}
                      </p>
                      <p>
                        <span className="font-medium">Night Parking:</span>{" "}
                        {parking.nightParking}
                      </p>
                      {parking.distance && (
                        <p>
                          <span className="font-medium">Distance:</span>{" "}
                          <span className="text-blue-600">{parking.distance} km</span>
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          className="bg-blue-500 text-white hover:bg-blue-600"
                          onClick={() => handleViewDetails(parking)}
                        >
                          View Details
                        </Button>
                        <Button 
                          className="bg-red-500 text-white hover:bg-red-600"
                          onClick={() => handleRemoveFavorite(parking.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </Navigation>
  );
};

export default ParkSMART;