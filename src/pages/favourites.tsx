import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Navigation } from '~/components/global/navigation';
import { TopBar } from '~/components/global/top-bar-others';

interface ParkingLocation {
  id: string;
  name: string;
  location: string;
  carParkType: string;
  typeOfParkingSystem: string;
  availableLots: string;
  pricing: string;
  availabilityColor: string;
}

const ParkSMART: React.FC = () => {
  // Function to determine availability color based on number of lots
  const getAvailabilityColor = (availability: string): string => {
    const lots = parseInt(availability);
    if (isNaN(lots)) return 'text-green-600';
    return lots <= 5 ? 'text-red-600' : 'text-green-600';
  };

  // Mock distances array for UI
  const mockDistances = ['0.5', '1.2', '2.0', '0.8', '1.5', '3.2'];

  // Favorite parking locations data structure
  const favoriteLocations: ParkingLocation[] = [
    {
      id: '1',
      name: 'Takashimaya Parking',
      location: 'Orchard',
      carParkType: 'Multi-story',
      typeOfParkingSystem: 'Electronic',
      availableLots: '27 Lots',
      pricing: '$12/hr',
      availabilityColor: getAvailabilityColor('27')
    },
    {
      id: '2',
      name: 'NTU Parking',
      location: 'Jurong West',
      carParkType: 'Open-air',
      typeOfParkingSystem: 'Coupon',
      availableLots: '17 Lots',
      pricing: '$2/hr',
      availabilityColor: getAvailabilityColor('17')
    },
    {
      id: '3',
      name: 'Uptown Parking',
      location: 'Jurong West',
      carParkType: 'Multi-story',
      typeOfParkingSystem: 'Electronic',
      availableLots: '2 Lots',
      pricing: '$2/hr',
      availabilityColor: getAvailabilityColor('2')
    },
    {
      id: '4',
      name: 'Downtown Parking',
      location: 'Downtown',
      carParkType: 'Basement',
      typeOfParkingSystem: 'Electronic',
      availableLots: '67 Lots',
      pricing: '$9/hr',
      availabilityColor: getAvailabilityColor('67')
    },
    {
      id: '5',
      name: 'Changi Jewel Parking',
      location: 'Changi',
      carParkType: 'Multi-story',
      typeOfParkingSystem: 'Electronic',
      availableLots: '17 Lots',
      pricing: '$2.50/hr',
      availabilityColor: getAvailabilityColor('17')
    },
    {
      id: '6',
      name: 'Vivocity Parking',
      location: 'Harbourfront',
      carParkType: 'Basement',
      typeOfParkingSystem: 'Electronic',
      availableLots: '8 Lots',
      pricing: '$3.50/hr',
      availabilityColor: getAvailabilityColor('8')
    }
  ];

  // Handler functions
  const handleViewDetails = (parking: ParkingLocation) => {
    console.log('View details for:', parking.name);
    // Implement navigation or modal display for details
  };

  const handleRemoveFavorite = (parkingId: string) => {
    console.log('Remove from favorites:', parkingId);
    // Implement removal logic
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
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favoriteLocations.map((parking, index) => (
                <Card
                  key={`${parking.id}-${index}`}
                  className="overflow-hidden border border-gray-200 dark:border-gray-600 dark:bg-gray-700"
                >
                  <CardContent className="p-6 dark:text-white">
                    <h3 className="mb-2 text-xl font-bold">{parking.name}</h3>
                    <p><span className="font-medium">Location:</span> {parking.location}</p>
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
          </div>
        </main>
      </div>
    </Navigation>
  );
};

export default ParkSMART;