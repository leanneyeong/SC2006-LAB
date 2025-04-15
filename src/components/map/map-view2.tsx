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
  const [openWindowOrigin, setOpenWindowOrigin] = useState(false);
  const [carparks, setCarparks] = useState<Carpark[]>([]);
  const [selectedCarpark, setSelectedCarpark] = useState<CarparkData | null>(
    null,
  );

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [routesLibrary, setRoutesLibrary] =
    useState<google.maps.RoutesLibrary | null>(null);
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [showMarkers, setShowMarkers] = useState(true); // Ensure markers are visible by default
  const [showDirection, setShowDirection] = useState(false);

  // Handle navigation to car-park-details page
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
      },
    );
  }, []);

  // Make sure carparks data is properly loaded
  useEffect(() => {
    if (carparks_data && carparks_data.length > 0) {
      console.log(`Loaded ${carparks_data.length} carparks for map display`);
    }
  }, [carparks_data]);

  const getRoute = ({
    origin,
    destination,
  }: {
    origin: Position;
    destination: Position;
  }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");

    useEffect(() => {
      if (!routesLibrary || !map) return;
      if (directionsService && directionsRenderer) return;
      setDirectionsService(new routesLibrary.DirectionsService());
      setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [routesLibrary, map, directionsService, directionsRenderer]);

    useEffect(() => {
      if (!directionsService || !directionsRenderer) return;

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
        });
    }, [directionsService, directionsRenderer, origin, destination]);

    return null;
  };

  const DisplayRoute = () => {
    if (!directionsRenderer) return null;
    useEffect(() => {
      directionsRenderer.setMap(map);
      directionsRenderer.setRouteIndex(routeIndex);
    }, [directionsRenderer, map, routeIndex]);
    return null;
  };

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
        onClick={() => {
          // Implement favorite functionality
          console.log("Favorite button clicked");
        }}
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
        onClick={() => {
          // Implement info functionality
          console.log("Info button clicked");
        }}
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

  const DirectionsUpdated = ({
    origin,
    destination,
  }: {
    origin: Position;
    destination: Position;
  }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    // const [directionsService, setDirectionsService] =
    //   useState<google.maps.DirectionsService>();
    // const [directionsRenderer, setDirectionsRenderer] =
    //   useState<google.maps.DirectionsRenderer>();
    // const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
    // const [routeIndex, setRouteIndex] = useState(0);
    // const selected = routes[routeIndex];
    // const leg = selected?.legs[0];

    if (routes && routes.length > 0 && routeIndex && directionsRenderer) {
      console.log("return null");
      return null;
    }

    useEffect(() => {
      if (!routesLibrary || !map) return;
      setDirectionsService(new routesLibrary.DirectionsService());
      setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [routesLibrary, map]);

    useEffect(() => {
      if (!directionsService || !directionsRenderer) return;

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
        });
    }, [directionsService, directionsRenderer, origin, destination]);

    useEffect(() => {
      if (!directionsRenderer) return;
      directionsRenderer.setRouteIndex(routeIndex);
    }, [routeIndex, directionsRenderer]);

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
            zoomControl={false}
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

            {showDirection && selectedCarpark && currentLocation && (
              <Directions
                origin={currentLocation}
                destination={{
                  lat: selectedCarpark.location.y,
                  lng: selectedCarpark.location.x,
                }}
                directionsService={directionsService}
                setDirectionsService={setDirectionsService}
                directionsRenderer={directionsRenderer}
                setDirectionsRenderer={setDirectionsRenderer}
                routes={routes}
                setRoutes={setRoutes}
                setRouteIndex={setRouteIndex}
                routeIndex={routeIndex}
              />
            )}

            {!selectedCarpark && (
              <ClearMap
                directionsRenderer={directionsRenderer}
                setDirectionsRenderer={setDirectionsRenderer}
              />
            )}

            {/* {showDirection && selectedCarpark && currentLocation && (
              <DirectionsUpdated
                origin={currentLocation}
                destination={{
                  lat: selectedCarpark.location.y,
                  lng: selectedCarpark.location.x,
                }}
              />
            )} */}
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

interface ClearMapProps {
  directionsRenderer: google.maps.DirectionsRenderer | undefined;
  setDirectionsRenderer: React.Dispatch<
    React.SetStateAction<google.maps.DirectionsRenderer | undefined>
  >;
}

const ClearMap = ({
  directionsRenderer,
  setDirectionsRenderer,
}: ClearMapProps) => {
  const map = useMap();

  useEffect(() => {
    if (directionsRenderer) {
      directionsRenderer.setMap(map);
      directionsRenderer.setMap(null);
    }
  }, [directionsRenderer, map]);

  return null;
};

interface DirectionsProps {
  origin: Position;
  destination: Position;
  directionsService: google.maps.DirectionsService | undefined;
  setDirectionsService: React.Dispatch<
    React.SetStateAction<google.maps.DirectionsService | undefined>
  >;
  directionsRenderer: google.maps.DirectionsRenderer | undefined;
  setDirectionsRenderer: React.Dispatch<
    React.SetStateAction<google.maps.DirectionsRenderer | undefined>
  >;
  routes: google.maps.DirectionsRoute[];
  setRoutes: React.Dispatch<
    React.SetStateAction<google.maps.DirectionsRoute[]>
  >;
  setRouteIndex: React.Dispatch<React.SetStateAction<number>>;
  routeIndex: number;
}

const Directions = ({
  origin,
  destination,
  directionsService,
  setDirectionsService,
  directionsRenderer,
  setDirectionsRenderer,
  routes,
  setRoutes,
  setRouteIndex,
  routeIndex,
}: DirectionsProps) => {
  // https://www.youtube.com/watch?v=tFjOIZGCvuQ&list=PL2rFahu9sLJ2QuJaKKYDaJp0YqjFCDCtN&index=3
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  // const [directionsService, setDirectionsService] =
  //   useState<google.maps.DirectionsService>();
  // const [directionsRenderer, setDirectionsRenderer] =
  //   useState<google.maps.DirectionsRenderer>();

  if (routes && routes.length > 0 && routeIndex && directionsRenderer) {
    console.log("return null");
    return null;
  }

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
  // console.log(routes);
  // console.log(routeIndex);

  // sometimes api got problem, idk why but this works
  if (routes.length === 0) return null;

  const selectedRoute = routes[routeIndex];
  if (selectedRoute?.legs.length === 0) return null;

  const leg = selectedRoute?.legs[0];

  // routes.map((route) => {
  //   console.log(route.summary);
  // });

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

interface CarparkDropdownProps {
  carpark: CarparkData | null;
}

const CarparkDropdown = ({ carpark }: CarparkDropdownProps) => {
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
          <span className="text-sm font-semibold">{carpark.address}</span>
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
                <td className={getAvailabilityColour(carpark.availableLots)}>
                  {carpark.availableLots}
                </td>
              </tr>
              <br />
            </tbody>
          </table>
          {/* <DisplayPrice carpark_id={carpark.carParkNo ?? ""} /> */}
        </div>
      )}
    </div>
  );
};
