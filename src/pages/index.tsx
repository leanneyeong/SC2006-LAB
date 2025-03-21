import React, { useState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '~/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const ParkSMART = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [evCharging, setEvCharging] = useState(true);
  const [shelteredCarpark, setShelteredCarpark] = useState(false);
  
  // Sample parking data
  const parkingLocations = [
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
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation Bar */}
      <header className="bg-blue-500 text-white p-4">
        <div className="container mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">ParkSMART</h1>
          
          <div className="flex flex-col md:flex-row gap-2 items-start md:items-center flex-grow md:ml-6">
            <div className="flex">
              <Input
                type="text"
                placeholder="Search for a Carpark..."
                className="mr-2 text-black w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="secondary">Search</Button>
            </div>
            
            <div className="flex items-center ml-0 md:ml-4 space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ev-charging" 
                  checked={evCharging}
                  onCheckedChange={setEvCharging}
                />
                <label htmlFor="ev-charging" className="text-sm font-medium">
                  EV Charging
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sheltered" 
                  checked={shelteredCarpark}
                  onCheckedChange={setShelteredCarpark}
                />
                <label htmlFor="sheltered" className="text-sm font-medium">
                  Sheltered Carpark
                </label>
              </div>
            </div>
            
            <div className="ml-0 md:ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-black">
                    Sort by... <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Alphabetical Order</DropdownMenuItem>
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem>Availability</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 flex flex-grow">
        {/* Sidebar */}
        <div className="hidden md:block w-48 bg-gray-100 mr-4 p-4 rounded">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-500">Profile Settings</h3>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Find Car Parks</h3>
            </div>
            <div>
              <h3 className="font-medium text-blue-500">Favourites</h3>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Leave A Review</h3>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Notifications</h3>
            </div>
          </div>
        </div>
        
        {/* Results Area */}
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-6">Showing results for "input text"</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingLocations.map((parking, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{parking.name}</h3>
                  <p><span className="font-medium">Location:</span> {parking.location}</p>
                  <p><span className="font-medium">Price:</span> {parking.price}</p>
                  <p>
                    <span className="font-medium">Availability:</span>{' '}
                    <span className={parking.availabilityColor}>{parking.availability}</span>
                  </p>
                  <Button className="mt-4 bg-blue-500 hover:bg-blue-600">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParkSMART;