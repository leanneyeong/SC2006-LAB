import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Navigation } from "~/components/global/navigation-admin";
import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/router";

interface Carpark {
  id: string;
  name: string;
  area: string;
  availability: number;
  agency: string;
  price: number;
}

// Main CarparkManagement Component
const CarparkManagement: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Sample carpark data
  const carparks: Carpark[] = [
    {
      id: "CP001",
      name: "Central Plaza Parking",
      area: "Downtown",
      availability: 45,
      agency: "Urban Parking Ltd",
      price: 2.50
    },
    {
      id: "CP002",
      name: "Riverside Garage",
      area: "Waterfront",
      availability: 12,
      agency: "City Spaces Inc",
      price: 3.00
    },
    {
      id: "CP003",
      name: "Market Square Lot",
      area: "Commercial District",
      availability: 0,
      agency: "Urban Parking Ltd",
      price: 2.75
    },
    {
      id: "CP004",
      name: "Tech Hub Parking",
      area: "Innovation Park",
      availability: 78,
      agency: "Smart Park Solutions",
      price: 4.50
    },
    {
      id: "CP005",
      name: "Stadium Lot A",
      area: "Sports Complex",
      availability: 120,
      agency: "Event Parking Co",
      price: 5.00
    },
    {
      id: "CP006",
      name: "Airport Terminal Garage",
      area: "Airport",
      availability: 35,
      agency: "Transit Authority",
      price: 6.25
    },
    {
      id: "CP007",
      name: "Mall Central Parking",
      area: "Shopping District",
      availability: 24,
      agency: "Retail Park Management",
      price: 2.00
    }
  ];

  // Handle navigation to different sections
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Navigation>
      <div className="flex min-h-screen flex-col">
        {/* Top Header Bar */}
        <header className="bg-blue-500 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Car Park Management</h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for a Carpark..."
                  className="w-64 rounded-md bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="secondary" className="flex items-center gap-1">
                <Search size={16} />
                Search
              </Button>
              <Button variant="secondary" className="bg-green-600 text-white hover:bg-green-700">
                Add New Carpark
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1">
          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">CarparkID</TableHead>
                      <TableHead className="font-semibold">Carpark Name</TableHead>
                      <TableHead className="font-semibold">Area</TableHead>
                      <TableHead className="font-semibold">Availability</TableHead>
                      <TableHead className="font-semibold">Agency</TableHead>
                      <TableHead className="text-right font-semibold">Price</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carparks.map((carpark) => (
                      <TableRow key={carpark.id}>
                        <TableCell>{carpark.id}</TableCell>
                        <TableCell>{carpark.name}</TableCell>
                        <TableCell>{carpark.area}</TableCell>
                        <TableCell>{carpark.availability}</TableCell>
                        <TableCell>{carpark.agency}</TableCell>
                        <TableCell className="text-right">${carpark.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Select Car Park to manage.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </Navigation>
  );
};

export default CarparkManagement;