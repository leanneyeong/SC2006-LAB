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
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { useRouter } from "next/router";
import DirectionsIcon from "@mui/icons-material/Directions";
import { env } from "~/env";
import { RouterOutputs } from "~/utils/api";
import getAvailabilityColour from "~/utils/get-availability-colour";
import getDistanceBetweenCarPark from "~/utils/get-distance-between-carpark";
import CarparksMarker from "./carpark-markers";
import { api } from "~/utils/api";
import { FavouriteButton } from "../global/favourite-button";

// Define types for the carpark data
type CarparkData = RouterOutputs["carPark"]["getCarparks"][number];
type DirectionsResult = google.maps.DirectionsResult;

// Define position type
interface Position {
  lat: number;
  lng: number;
}

export default function TestMap({ carparks_data }: { carparks_data: CarparkData[] }) {
  const router = useRouter();
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [selectedCarpark, setSelectedCarpark] = useState<CarparkData | null>(null);
  
  // Force refresh of data when isFavourited changes
  const carParkUtils = api.useUtils().carPark;
  const [showDirection, setShowDirection] = useState(false);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [showMarkers, setShowMarkers] = useState(true); // Ensure markers are visible by default
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  // Handle navigation to car-park-details page
  const handleViewDetails = (carpark: CarparkData) => {
    void router.push({
      pathname: "/car-park-details",
      query: {
        id: carpark.id,
        name: carpark.address,
        carParkType: carpark.carParkType,
        typeOfParkingSystem: carpark.typeOfParkingSystem,
        availableLots: carpark.availableLots,
        carParkNo: carpark.carParkNo,
        isFavorite: carpark.isFavourited,
        locationX: carpark.location.x.toString(),
        locationY: carpark.location.y.toString()
      },
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);
        
        // Get the map element without unnecessary assertion
        const mapElement = document.querySelector('div[aria-label="Map"]');
        
        // Check if mapElement exists and has correct type
        if (mapElement instanceof HTMLElement && window.google?.maps) {
          const mapInstance = new window.google.maps.Map(mapElement);
          mapInstance.panTo(location);
          mapInstance.setZoom(15);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, []);
  
  // Make sure carparks data is properly loaded
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

    void directionsService.route(
      {
        origin: currentLocation,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          setRoutes(result.routes);
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

            <MapControl position={ControlPosition.TOP_RIGHT}>
              <Button
                className="mt-4 -translate-x-3 bg-blue-500 text-white hover:bg-blue-600"
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
        {/* Carpark Details */}
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
            routeIndex={routeIndex}
            setRouteIndex={setRouteIndex}
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
      className="flex h-12 w-12 -translate-x-1 transform cursor-pointer items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md transition-transform duration-200 hover:shadow-lg focus:outline-none"
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
  // Create local state to track the favorite status
  const [isFavourited, setIsFavourited] = useState(carpark.isFavourited);
  
  // Update local state when carpark prop changes
  useEffect(() => {
    setIsFavourited(carpark.isFavourited);
  }, [carpark.isFavourited]);
  
  return (
    <div
      className="relative w-full p-4 bg-background text-foreground dark:bg-card dark:text-card-foreground rounded-lg shadow-md"
    >
      {/* Close Button - Top Right */}
      <button
        className="absolute top-2.5 right-2.5 p-1.5 bg-destructive text-destructive-foreground border-none rounded cursor-pointer text-sm"
        onClick={onClose}
      >
        Close
      </button>

      <div className="flex space-x-2 mt-2 mb-4">
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => onViewDetails(carpark)}
        >
          View Details
        </Button>
        
        <FavouriteButton 
          carParkId={carpark.id}
          isFavourited={isFavourited}
          onFavouriteChange={() => setIsFavourited(!isFavourited)}
        />
        
        <Button
          className="bg-blue-500 text-white hover:bg-blue-600"
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

      <CardContent className="p-6">
        <h3 className="mb-2 text-xl font-bold">{carpark.carParkNo}</h3>
        <p>
          <span className="font-medium">Name:</span> {carpark.address || "Unknown"}
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
        <p>
          <span className="font-medium">Pricing:</span>{" "}
          {(() => {
            const central_area = ["ACB", "BBB", "BRBI", "CY", "DUXM", "HLM", "KAB", "KAM", "KAS", "PRM", "SLS", "SR1", "SR2", "TPM", "UCS", "WCB"];
            const peak_hour = ["ACB", "CY", "SE21", "SE22", "SE24", "MP14", "MP15", "MP16", "HG9", "HG9T", "HG15", "HG16"];
            const lub = ["GSML", "BRBL", "JCML", "T55", "GEML", "KAML", "J57L", "J60L", "TPL", "EPL", "BL8L"];
            
            if (lub.includes(carpark.carParkNo)) {
              return "$2-$4/30min";
            } else if (peak_hour.includes(carpark.carParkNo)) {
              return "$0.60-$1.20/30min";
            } else if (central_area.includes(carpark.carParkNo)) {
              return "$0.60-$1.20/30min";
            } else {
              return "$0.60/30min";
            }
          })()}
        </p>
      </CardContent>
    </div>
  );
};

interface DirectionDetailsCardProps {
  routes: google.maps.DirectionsRoute[];
  routeIndex: number;
  setRouteIndex: React.Dispatch<React.SetStateAction<number>>;
}

const DirectionDetailsCard = ({
  routes,
  routeIndex,
  setRouteIndex,
}: DirectionDetailsCardProps) => {
  // sometimes api got problem, idk why but this works
  if (routes.length === 0) return null;

  const selectedRoute = routes[routeIndex];
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
      <h3>
        <strong>{selectedRoute?.summary ?? "Route"}</strong>
      </h3>
      <p>
        {leg?.start_address ? leg.start_address.split(",")[0] : "Start"} to {leg?.end_address ? leg.end_address.split(",")[0] : "Destination"}
      </p>
      <p>Distance: {leg?.distance ? leg.distance.text : "Unknown"}</p>
      <p>Duration: {leg?.duration ? leg.duration.text : "Unknown"}</p>
      <br></br>

      <h3>
        <strong>Other Routes</strong>
      </h3>
      <ul>
        {routes.map((route, index) => {
          return (
            <li key={index}>
              <a
                href="#"
                onClick={() => setRouteIndex(index)}
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                {route.summary}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};