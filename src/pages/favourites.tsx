// Function to determine availability color based on number of lots
const getAvailabilityColor = (availability: string): string => {
    const lots = parseInt(availability);
    if (isNaN(lots)) return 'text-green-600';
    return lots <= 5 ? 'text-red-600' : 'text-green-600';
  };
  
  import React, { useState, useEffect } from 'react';
  import { Button } from '~/components/ui/button';
  import { Card, CardContent } from '~/components/ui/card';
  import { Checkbox } from '~/components/ui/checkbox';
  import { Navigation } from '~/components/global/navigation';
  import { TopBar } from '~/components/global/top-bar-others';
  
  interface ParkingLocation {
    name: string;
    location: string;
    price: string;
    availability: string;
    sheltered: boolean;
    evParking: boolean;
  }
  
  const ParkSMART: React.FC = () => {
    // State for filters
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // Favorite parking locations data structure
    const favoriteLocations: ParkingLocation[] = [
      {
        name: 'Takashimaya Parking',
        location: 'Orchard',
        price: '$12/hr',
        availability: '27 Lots',
        sheltered: true,
        evParking: true
      },
      {
        name: 'NTU Parking',
        location: 'Jurong West',
        price: '$2/hr',
        availability: '17 Lots',
        sheltered: false,
        evParking: true
      },
      {
        name: 'Uptown Parking',
        location: 'Jurong West',
        price: '$2/hr',
        availability: '2 Lots',
        sheltered: false,
        evParking: true
      },
      {
        name: 'Downtown Parking',
        location: 'Downtown',
        price: '$9/hr',
        availability: '67 Lots',
        sheltered: false,
        evParking: false
      },
      {
        name: 'NTU Parking',
        location: 'Jurong West',
        price: '$2/hr',
        availability: '17 Lots',
        sheltered: false,
        evParking: true
      },
      {
        name: 'Uptown Parking',
        location: 'Jurong West',
        price: '$2/hr',
        availability: '17 Lots',
        sheltered: false,
        evParking: true
      }
    ];
  
    // State to track checkbox values - FIXED: using Record type instead of index signature
    const [checkboxStates, setCheckboxStates] = useState<Record<string, boolean>>({});
  
    // Initialize checkbox states based on parking data
    useEffect(() => {
      // FIXED: using Record type instead of index signature
      const initialStates: Record<string, boolean> = {};
      favoriteLocations.forEach((parking, index) => {
        initialStates[`sheltered-${index}`] = parking.sheltered;
        initialStates[`ev-${index}`] = parking.evParking;
      });
      setCheckboxStates(initialStates);
    }, []);
  
    // Handle checkbox changes
    const handleCheckboxChange = (id: string, checked: boolean) => {
      setCheckboxStates(prev => ({
        ...prev,
        [id]: checked
      }));
    };
  
    return (
      <Navigation>
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <TopBar />
          
          {/* Content */}
          <main className="p-6 flex-1 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-6 dark:bg-gray-700 dark:border-gray-600">
                <CardContent className="py-0.5 px-6 flex justify-center">
                  <h2 className="text-xl font-semibold dark:text-white">Favourited Car Parks</h2>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteLocations.map((parking, index) => (
                  <Card key={index} className="overflow-hidden border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                    <CardContent className="p-4 dark:text-white">
                      <h3 className="text-lg font-bold mb-1">{parking.name}</h3>
                      <p className="text-sm mb-1"><span className="font-medium">Location:</span> {parking.location}</p>
                      <p className="text-sm mb-1"><span className="font-medium">Price:</span> {parking.price}</p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Availability:</span>{' '}
                        <span className={getAvailabilityColor(parking.availability)}>
                          {parking.availability}
                        </span>
                      </p>
                      <div className="flex items-center mb-1">
                        <Checkbox 
                          id={`sheltered-${index}`} 
                          checked={checkboxStates[`sheltered-${index}`] ?? false}
                          onCheckedChange={(checked) => handleCheckboxChange(`sheltered-${index}`, checked as boolean)}
                          className="dark:border-gray-400"
                        />
                        <label htmlFor={`sheltered-${index}`} className="ml-2 text-sm dark:text-gray-200">
                          Sheltered
                        </label>
                      </div>
                      <div className="flex items-center mb-3">
                        <Checkbox 
                          id={`ev-${index}`} 
                          checked={checkboxStates[`ev-${index}`] ?? false}
                          onCheckedChange={(checked) => handleCheckboxChange(`ev-${index}`, checked as boolean)}
                          className="dark:border-gray-400"
                        />
                        <label htmlFor={`ev-${index}`} className="ml-2 text-sm dark:text-gray-200">
                          EV Parking
                        </label>
                      </div>
                      <Button 
                        variant="outline" 
                        className="text-xs w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        View Details
                      </Button>
                    </CardContent>
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