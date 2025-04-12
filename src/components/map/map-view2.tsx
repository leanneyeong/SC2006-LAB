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

interface CarparkData {
  id: string;
  name: string; // Now using address as name
  carParkType: string;
  typeOfParkingSystem: string;
  availableLots: string;
  pricing?: string; // Optional pricing information
  availabilityColor: string;
  carParkNo?: string;
  location: [number, number];
  distance: number;
  lat: number;
  lng: number;
}

// Define position type
interface Position {
  lat: number;
  lng: number;
}

export default function MapViewUpdated({ carparks_data }) {
  const router = useRouter();
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [openWindowOrigin, setOpenWindowOrigin] = useState(false);
  const [carparks, setCarparks] = useState<Carpark[]>([]);
  const [selectedCarpark, setSelectedCarpark] = useState<CarparkData | null>(
    null,
  );
  const [showDirection, setShowDirection] = useState(false);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);

  // Handle navigation to car-park-details page
  const handleViewDetails = (carpark: Carpark) => {
    void router.push({
      pathname: "/car-park-details",
      query: {
        id:
          carpark.CarParkID ||
          carpark.Development.replace(/\s+/g, "-").toLowerCase(),
        name: carpark.Development,
        area: carpark.Area,
        lots: carpark.AvailableLots,
        type: carpark.LotType,
        agency: carpark.Agency,
      },
    });
  };

  useEffect(() => {
    // setCarparks(formatCarparkData(carparkData) as Carpark[]);
    // console.log(carparks)

    // get current user location
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      //   console.log("Current Location:", location);
      setCurrentLocation(location);
    });
  }, []);

  const DirectionButton = () => {
    const map = useMap();
    return (
      <button
        className="flex h-12 w-12 -translate-x-2 translate-y-2 transform cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => {
          setShowDirection(true);
        }}
      >
        <DirectionsIcon />
      </button>
    );
  };

  const FavouriteButton = () => {
    const map = useMap();
    return (
      <button
        className="flex h-12 w-12 -translate-x-3 translate-y-2 transform cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => {}}
      >
        <Star />
      </button>
    );
  };

  const InfoButton = () => {
    const map = useMap();
    return (
      <button
        className="flex h-12 w-12 -translate-x-4 translate-y-2 transform cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => {}}
      >
        <InfoIcon />
      </button>
    );
  };

  const CancelButton = () => {
    const map = useMap();
    return (
      <button
        className="flex h-12 w-12 -translate-x-5 translate-y-2 transform cursor-pointer items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
        onClick={() => {
          setSelectedCarpark(null);
          setShowDirection(false);
        }}
      >
        <X />
      </button>
    );
  };

  return (
    <div>
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
      >
        <div
          style={{
            width: "100%",
            height: "70vh",
          }}
        >
          <Map
            defaultZoom={12}
            defaultCenter={origin}
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

            {/* <MapControl position={ControlPosition.TOP_RIGHT}>
              <CarparkDropdown carpark={selectedCarpark} />
            </MapControl> */}

            {/* buttons */}
            {/* {selectedCarpark && (
              <>
                <MapControl position={ControlPosition.TOP_RIGHT}>
                  <DirectionButton />
                </MapControl>

                <MapControl position={ControlPosition.TOP_RIGHT}>
                  <FavouriteButton />
                </MapControl>

                <MapControl position={ControlPosition.TOP_RIGHT}>
                  <InfoButton />
                </MapControl>

                <MapControl position={ControlPosition.TOP_RIGHT}>
                  <CancelButton />
                </MapControl>
              </>
            )} */}

            {/* Carpark Markers Component */}
            {!showMarkers && selectedCarpark && (
              <AdvancedMarker
                position={{
                  lat: selectedCarpark.lat,
                  lng: selectedCarpark.lng,
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

            {showDirection && selectedCarpark && currentLocation && (
              <Directions
                origin={currentLocation}
                destination={selectedCarpark}
                setRoutes={setRoutes}
                setRouteIndex={setRouteIndex}
                routeIndex={routeIndex}
              />
            )}
          </Map>
        </div>
      </APIProvider>

      <div
        style={{
          display: showDirection ? "flex" : "block",
          width: "100%",
          gap: "20px", // Optional space between the two divs
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
                console.log("showDirection: false");
              }}
              onShowDirection={setShowDirection}
              onViewDetails={handleViewDetails}
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

interface DirectionsProps {
  origin: Position;
  destination: Position;
  setRoutes: React.Dispatch<
    React.SetStateAction<google.maps.DirectionsRoute[]>
  >;
  setRouteIndex: React.Dispatch<React.SetStateAction<number>>;
  routeIndex: number;
}

const Directions = ({
  origin,
  destination,
  setRoutes,
  setRouteIndex,
  routeIndex,
}: DirectionsProps) => {
  // https://www.youtube.com/watch?v=tFjOIZGCvuQ&list=PL2rFahu9sLJ2QuJaKKYDaJp0YqjFCDCtN&index=3
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination)
      return;

    void directionsService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      })
      .catch((err) => console.error("Directions request failed:", err));

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, origin, destination, setRoutes]);

  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [directionsRenderer, routeIndex]);

  return null;
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
  console.log(routes);
  console.log(routeIndex);

  // sometimes api got problem, idk why but this works
  if (routes.length === 0) return null;

  const selectedRoute = routes[routeIndex];
  const leg = selectedRoute?.legs[0];

  routes.map((route) => {
    console.log(route.summary);
  });

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
        <strong>{selectedRoute.summary}</strong>
      </h3>
      <p>
        {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
      </p>
      <p>Distance: {leg.distance.text}</p>
      <p>Duration: {leg.duration.text}</p>
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

// 🆕 OriginMarker Component
interface OriginMarkerProps {
  position: Position;
  openWindow: boolean;
  onClick: () => void;
  onClose: () => void;
}

const OriginMarker = ({
  position,
  openWindow,
  onClick,
  onClose,
}: OriginMarkerProps) => {
  return (
    <>
      <AdvancedMarker position={position} onClick={onClick}>
        <Pin background={"green"} borderColor={"green"} glyphColor={"white"} />
      </AdvancedMarker>

      {openWindow && (
        <InfoWindow position={position} onCloseClick={onClose}>
          <p style={{ color: "black" }}>Origin</p>
        </InfoWindow>
      )}
    </>
  );
};

// 🆕 CarparksMarker Component
interface CarparksMarkerProps {
  carparks: CarparkData[];
  selectedCarpark: CarparkData | null;
  onSelectCarpark: (carpark: CarparkData) => void;
  onShowDirection: (show: boolean) => void;
}

const CarparksMarker = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
}: CarparksMarkerProps) => {
  return (
    <>
      {carparks.map((carpark) => (
        <React.Fragment key={carpark.carParkNo}>
          <AdvancedMarker
            position={{ lat: carpark.lat, lng: carpark.lng }}
            onClick={() => onSelectCarpark(carpark)}
          />

          {selectedCarpark &&
            selectedCarpark.carParkNo === carpark.carParkNo && (
              <InfoWindow
                position={{ lat: carpark.lat, lng: carpark.lng }}
                headerContent={
                  <strong>{carpark.name || "Unknown Carpark"}</strong>
                }
                onCloseClick={() => {
                  // onSelectCarpark(null);
                  // onShowDirection(false);
                  // console.log("showDirection: false");
                }}
              >
                <div style={{ color: "black" }}>
                  <p>Distance: {carpark.distance} km</p>
                  <p>Available Lots: {carpark.availableLots}</p>
                </div>
              </InfoWindow>
            )}
        </React.Fragment>
      ))}
    </>
  );
};

interface CarparkDetailsCardProps {
  carpark: CarparkData;
  onClose: () => void;
  onShowDirection: (show: boolean) => void;
  onViewDetails: (carpark: CarparkData) => void;
}

const CarparkDetailsCard = ({
  carpark,
  onClose,
  onShowDirection,
  onViewDetails,
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
        Close
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
            console.log("showDirection: true");
          }}
        >
          Direction
        </Button>
      </div>

      <CardContent className="p-6 dark:text-white">
        <h3 className="mb-2 text-xl font-bold">{carpark.carParkNo}</h3>
        <p>
          <span className="font-medium">Name:</span> {carpark.name || "Unknown"}
        </p>
        <p>
          <span className="font-medium">Availability:</span>{" "}
          <span className={carpark.availabilityColor}>
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

const CarparkDropdown = ({ carpark }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`mb-4 translate-x-[-5px] translate-y-[5px] rounded-2xl border shadow-md transition-all duration-300 ease-in-out`}
      style={{ width: "350px" }} // Set a fixed width
    >
      <button
        onClick={() => {
          if (carpark) setIsOpen(!isOpen);
        }}
        className="flex w-full items-center justify-between bg-white p-4 hover:bg-gray-100"
      >
        {carpark && (
          <span className="text-sm font-semibold">{carpark.name}</span>
        )}

        <svg
          className={`h-5 w-5 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && carpark && (
        <div className="max-h-60 overflow-y-auto bg-gray-50 p-4">
          <table className="w-full text-left text-xs text-gray-700">
            <tbody>
              <tr>
                <th className="py-1 pr-3 font-medium text-gray-600">
                  Carpark No
                </th>
                <td className="py-1 text-gray-800">{carpark.carParkNo}</td>
              </tr>

              <tr>
                <th className="py-1 pr-3 font-medium text-gray-600">
                  Type of Parking
                </th>
                <td className="py-1 text-gray-800">
                  {carpark.typeOfParkingSystem}
                </td>
              </tr>

              <tr>
                <th className="py-1 pr-3 font-medium text-gray-600">
                  Lots Available
                </th>
                <td className={carpark.availabilityColor}>
                  {carpark.availableLots}
                </td>
              </tr>
              <br />
            </tbody>
          </table>
          <DisplayPrice carpark_id={carpark.carParkNo} />
        </div>
      )}
    </div>
  );
};
