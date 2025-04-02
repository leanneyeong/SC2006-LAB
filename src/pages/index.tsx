import React, { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { TopBar } from "~/components/global/top-bar-home";
import { Navigation } from "~/components/global/navigation";
import MapView from "~/components/map/map-view";
import { carparkData, formatCarparkData } from "~/server/carpark/api";

interface ParkingLocation {
  name: string;
  location: string;
  price: string;
  availability: string;
  availabilityColor: string;
}

// Main ParkSMART Component
const ParkSMART: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);

  const parkingLocations = formatCarparkData(carparkData)

  // Sample parking data
  const parkingLocationsTest: ParkingLocation[] = [
    {
      name: "Katong Parking",
      location: "Katong",
      price: "$5/hr",
      availability: "10 Lots",
      availabilityColor: "text-green-600",
    },
    {
      name: "East Coast Park Parking",
      location: "East Coast Park",
      price: "$3/hr",
      availability: "3 Lots",
      availabilityColor: "text-red-600",
    },
    {
      name: "Takashimaya Parking",
      location: "Orchard",
      price: "$12/hr",
      availability: "27 Lots",
      availabilityColor: "text-green-600",
    },
    {
      name: "Ang Mo Kio Hub Parking",
      location: "Ang Mo Kio",
      price: "$3/hr",
      availability: "17 Lots",
      availabilityColor: "text-green-600",
    },
    {
      name: "NTU Parking",
      location: "Jurong West",
      price: "$2/hr",
      availability: "1 Lot",
      availabilityColor: "text-red-600",
    },
    {
      name: "Downtown Parking",
      location: "Downtown",
      price: "$5/hr",
      availability: "2 Lots",
      availabilityColor: "text-red-600",
    },
  ];

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
        />

        {/* Map */}
        <MapView />

        {/* Results Area */}
        <main className="flex-grow bg-gray-50 p-4 dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold dark:text-white">
            Showing results for &ldquo;input text&ldquo;
          </h2>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkingLocations.map((parking, index) => (
              <Card key={index} className="overflow-hidden border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <CardContent className="p-6 dark:text-white">
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
          </div> */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {parkingLocations.map((parking, index) => (
              <Card
                key={index}
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
                      {parking.AvailableLots} ({parking.LotType})
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Agency:</span>{" "}
                    {parking.Agency}
                  </p>
                  <Button className="mt-4 bg-blue-500 text-white hover:bg-blue-600">
                    View Details
                  </Button>
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
