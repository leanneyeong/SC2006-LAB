import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { TopBar } from '~/components/global/top-bar-home'
import { Navigation } from '~/components/global/navigation';

interface ParkingLocation {
  name: string;
  location: string;
  price: string;
  availability: string;
  availabilityColor: string;
}

// Main ParkSMART Component
const ParkSMART: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);
  
  // Sample parking data
  const parkingLocations: ParkingLocation[] = [
    {
      name: 'Katong Parking',
      location: 'Katong',
      price: '$5/hr',
      availability: '10 Lots',
      availabilityColor: 'text-green-600'
    },
    {
      name: 'East Coast Park Parking',
      location: 'East Coast Park',
      price: '$3/hr',
      availability: '3 Lots',
      availabilityColor: 'text-red-600'
    },
    {
      name: 'Takashimaya Parking',
      location: 'Orchard',
      price: '$12/hr',
      availability: '27 Lots',
      availabilityColor: 'text-green-600'
    },
    {
      name: 'Ang Mo Kio Hub Parking',
      location: 'Ang Mo Kio',
      price: '$3/hr',
      availability: '17 Lots',
      availabilityColor: 'text-green-600'
    },
    {
      name: 'NTU Parking',
      location: 'Jurong West',
      price: '$2/hr',
      availability: '1 Lot',
      availabilityColor: 'text-red-600'
    },
    {
      name: 'Downtown Parking',
      location: 'Downtown',
      price: '$5/hr',
      availability: '2 Lots',
      availabilityColor: 'text-red-600'
    }
  ];

  return (
    <Navigation>
      {/* Top Navigation Bar */}
      <div className="flex flex-col min-h-screen">
        <TopBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          evCharging={evCharging}
          setEvCharging={setEvCharging}
          shelteredCarpark={shelteredCarpark}
          setShelteredCarpark={setShelteredCarpark}
        />

        {/* Results Area */}
        <main className="flex-grow p-4">
          <h2 className="text-2xl font-bold mb-6">Showing results for "input text"</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingLocations.map((parking, index) => (
              <Card key={index} className="overflow-hidden border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{parking.name}</h3>
                  <p><span className="font-medium">Location:</span> {parking.location}</p>
                  <p><span className="font-medium">Price:</span> {parking.price}</p>
                  <p>
                    <span className="font-medium">Availability:</span>{' '}
                    <span className={parking.availabilityColor}>{parking.availability}</span>
                  </p>
                  <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </Navigation>
  );
};

export default ParkSMART;