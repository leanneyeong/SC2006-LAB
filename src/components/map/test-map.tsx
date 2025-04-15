"use client";

import {
  AdvancedMarker,
  APIProvider,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  Pin,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  Locate,
  Star,
  X,
  InfoIcon,
  Bookmark,
  SquareCheck,
  Square,
} from "lucide-react";
import React, { useMemo, useRef } from "react";
import { useEffect, useState } from "react";
import { carparkData, formatCarparkData } from "~/server/carpark/api";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { useRouter } from "next/router";
import DirectionsIcon from "@mui/icons-material/Directions";
import DisplayPrice from "./display-price";
import { env } from "~/env";
import { RouterOutputs } from "~/utils/api";
import getAvailabilityColour from "~/utils/get-availability-colour";
import getDistanceBetweenCarPark from "~/utils/get-distance-between-carpark";
import CarparksMarker from "./carpark-markers";
import { clear } from "console";

// Define types for the carpark data
interface Carpark {
  CarParkID: string;
  Development: string;
  Area: string;
  AvailableLots: string;
  LotType: string;
  Agency: string;
  lat: number;
  lng: number;
}

type CarparkData = RouterOutputs["carPark"]["getCarparks"][number];
type DirectionsResult = google.maps.DirectionsResult;

// Define position type
interface Position {
  lat: number;
  lng: number;
}

export default function MapViewUpdated({
  carparks_data,
}: {
  carparks_data: CarparkData[];
}) {
  const router = useRouter();
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [carparks, setCarparks] = useState<Carpark[]>([]);
  const [selectedCarpark, setSelectedCarpark] = useState<CarparkData | null>(
    null,
  );

  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [showMarkers, setShowMarkers] = useState(true); // Ensure markers are visible by default
  const [showDirection, setShowDirection] = useState(false);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);

  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

  const handleViewDetails = (carpark: CarparkData) => {
    const samplePricingData = {
      weekday: {
        morning: "0.60",
        afternoon: "1.20",
        evening: "0.60",
      },
      weekend: {
        morning: "1.20",
        afternoon: "1.50",
        evening: "0.60",
      },
    };
    void router.push({
      pathname: "/car-park-details",
      query: {
        id: carpark.id,
        name: carpark.address,
        carParkType: carpark.carParkType,
        typeOfParkingSystem: carpark.typeOfParkingSystem,
        availableLots: carpark.availableLots,
        pricing: JSON.stringify(samplePricingData),
        carParkNo: carpark.carParkNo,
        isFavorite: false,
        locationX: carpark.location.x.toString(),
        locationY: carpark.location.y.toString(),
      },
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);

        const mapElement = document.querySelector('div[aria-label="Map"]');

        if (mapElement instanceof HTMLElement && window.google?.maps) {
          const mapInstance = new window.google.maps.Map(mapElement);
          mapInstance.panTo(location);
          mapInstance.setZoom(15);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
    );
  }, []);

  useEffect(() => {
    if (carparks_data && carparks_data.length > 0) {
      console.log(`Loaded ${carparks_data.length} carparks for map display`);
    }
  }, [carparks_data]);

  function clearMap() {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
  }
  const fetchDirections = (destination: Position) => {
    if (!currentLocation) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: currentLocation,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          setRoutes(result.routes)
        }
      },
    );
  };

  const DisplayDirection = () => {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");

    useEffect(() => {
      if (!map || !routesLibrary || !directions) return;

      if (!directionsRenderer) {
        const renderer = new routesLibrary.DirectionsRenderer({ map });
        setDirectionsRenderer(renderer);
        renderer.setDirections(directions);
      }
      else{
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(directions);
      }
    }, [map, routesLibrary, directions]);

    return null;
  };

  return (
    <div>
      <APIProvider
        apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
      >
        <div
          style={{
            width: "100%",
            height: "70vh",
          }}
          className="relative"
        >
          <Map
            defaultZoom={15}
            defaultCenter={currentLocation ?? origin}
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
            fullscreenControl={false}
            streetViewControl={false}
            tiltInteractionEnabled={false}
            mapTypeControl={false}
          >
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
              <LocateButton currentLocation={currentLocation} />
            </MapControl>

            {currentLocation && (
              <GeolocationMarker position={currentLocation} />
            )}

            <MapControl position={ControlPosition.TOP_LEFT}>
              <Button
                className="mt-4 translate-x-3 bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setShowMarkers(!showMarkers)}
              >
                {showMarkers && <SquareCheck />}
                {!showMarkers && <Square />}
                Show Carpark
              </Button>
            </MapControl>

            {directions && showDirection && <DisplayDirection />}

            {!showMarkers && selectedCarpark && (
              <AdvancedMarker
                position={{
                  lat: selectedCarpark.location.y,
                  lng: selectedCarpark.location.x,
                }}
              />
            )}

            {showMarkers && (
              <CarparksMarker
                carparks={carparks_data}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={setSelectedCarpark}
                onShowDirection={setShowDirection}
              />
            )}
          </Map>
        </div>
      </APIProvider>

      <div
        style={{
          display: showDirection ? "flex" : "block",
          width: "100%",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: showDirection ? "50%" : "100%",
            transition: "width 0.3s ease",
          }}
        >
        {selectedCarpark && (
          <CarparkDetailsCard
            carpark={selectedCarpark}
            onClose={() => {
              setSelectedCarpark(null);
              setShowDirection(false);
              clearMap();
              console.log("showDirection: false");
            }}
            onShowDirection={setShowDirection}
            onViewDetails={handleViewDetails}
            fetchDirections={fetchDirections}
          />
        )}
        </div>

        {/* Directions or Map Panel */}
        {showDirection && (
          <DirectionDetailsCard
            routes={routes}
          />
        )}
      </div>
    </div>
  );
}

interface GeolocationMarkerProps {
  position: Position;
}

const GeolocationMarker = ({ position }: GeolocationMarkerProps) => {
  // https://github.com/visgl/react-google-maps/discussions/552
  const map = useMap();

  const geolocationMarker = useMemo(() => {
    if (!map || !position) return null;

    const marker = new google.maps.Marker({
      position,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "#4285F4",
        fillOpacity: 1,
        scale: 8,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    return { marker };
  }, [map, position]);

  useEffect(() => {
    if (geolocationMarker && map) {
      geolocationMarker.marker.setMap(map);
    }

    return () => {
      if (geolocationMarker) {
        geolocationMarker.marker.setMap(null);
      }
    };
  }, [geolocationMarker, map]);

  return null;
};

interface LocateButtonProps {
  currentLocation: Position | null;
}

const LocateButton = ({ currentLocation }: LocateButtonProps) => {
  const map = useMap();
  return (
    <button
      className="flex h-12 w-12 -translate-x-1 transform cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 hover:shadow-lg focus:outline-none"
      onClick={() => {
        if (map && currentLocation) {
          map.panTo(currentLocation);
          map.setZoom(15);
        }
      }}
    >
      <Locate />
    </button>
  );
};

interface CarparkDetailsCardProps {
  carpark: CarparkData;
  onClose: () => void;
  onShowDirection: (show: boolean) => void;
  onViewDetails: (carpark: CarparkData) => void;
  fetchDirections: (destination: Position) => void;
}

const CarparkDetailsCard = ({
  carpark,
  onClose,
  onShowDirection,
  onViewDetails,
  fetchDirections,
}: CarparkDetailsCardProps) => {
  return (
    <div
      style={{
        position: "relative", // Added for absolute positioning
        width: "100%",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        textAlign: "left",
      }}
    >
      {/* Close Button - Top Right */}
      <button
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "6px 10px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
        }}
        onClick={onClose}
      >
        <X />
      </button>

      {/* Show Direction Button */}
      <div>
        <Button
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => onViewDetails(carpark)}
        >
          View Details
        </Button>

        <Button className="mt-4 bg-blue-500 text-white hover:bg-blue-600">
          Add to Favourites
        </Button>

        <Button
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => {
            onShowDirection(true);
            fetchDirections({
              lat: carpark.location.y,
              lng: carpark.location.x,
            });
            console.log("showDirection: true");
          }}
        >
          Direction
        </Button>
      </div>

      <CardContent className="p-6 dark:text-white">
        <h3 className="mb-2 text-xl font-bold">{carpark.carParkNo}</h3>
        <p>
          <span className="font-medium">Name:</span>{" "}
          {carpark.address || "Unknown"}
        </p>
        <p>
          <span className="font-medium">Availability:</span>{" "}
          <span className={getAvailabilityColour(carpark.availableLots)}>
            {carpark.availableLots || "Unknown"}
          </span>
        </p>
        <p>
          <span className="font-medium">Carpark Type:</span>{" "}
          {carpark.carParkType || "Unknown"}
        </p>
        <p></p>
      </CardContent>
    </div>
  );
};

interface DirectionDetailsCardProps {
  routes: google.maps.DirectionsRoute[];
}

const DirectionDetailsCard = ({
  routes,
}: DirectionDetailsCardProps) => {

  useEffect(() => {
    console.log("Routes:", routes);
  }, [])
 
  // sometimes api got problem, idk why but this works
  if (routes.length === 0) return null;

  const selectedRoute = routes[0];
  if (selectedRoute?.legs.length === 0) return null;

  const leg = selectedRoute?.legs[0];

  return (
    <div
      style={{
        width: "50%",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        textAlign: "left",
      }}
    >
      {/* Replace with actual directions or map */}
      <h3>
        <strong>{selectedRoute?.summary ?? "Route"}</strong>
      </h3>
      <p>
        {leg?.start_address ? leg.start_address.split(",")[0] : "Start"} to{" "}
        {leg?.end_address ? leg.end_address.split(",")[0] : "Destination"}
      </p>
      <p>Distance: {leg?.distance ? leg.distance.text : "Unknown"}</p>
      <p>Duration: {leg?.duration ? leg.duration.text : "Unknown"}</p>
    </div>
  );
};