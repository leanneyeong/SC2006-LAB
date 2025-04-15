"use client";

import {
  AdvancedMarker,
  APIProvider,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Locate } from "lucide-react";
import { Button } from "../ui/button";
import { env } from "~/env";

// Define Review interface from database
interface DBReviewProps {
  userFirstName: string;
  userLastName: string;
  rating: number;
  description: string;
}

interface ReviewProps {
  text: string;
  title: string;
  rating: number;
  reviewer: {
    name: string;
    date: string;
    image: string;
  };
}

interface PricingData {
  weekday: {
    morning: string;
    afternoon: string;
    evening: string;
  };
  weekend: {
    morning: string;
    afternoon: string;
    evening: string;
  };
}

interface CarParkDetailProps {
  id: string;
  name: string;
  price: string;
  availableLots: string;
  sheltered: boolean;
  rating: number;
  reviews: ReviewProps[];
  pricing?: PricingData;
  carParkType: string;
  typeOfParkingSystem: string;
  availabilityColor: string;
  isFavourited: boolean;
  location?: {
    x: number;
    y: number;
  };
}

// Define position type
interface Position {
  lat: number;
  lng: number;
}

export default function CarparkDetailMap({
  carpark,
  showDirections,
}: {
  carpark: CarParkDetailProps;
  showDirections: boolean;
}) {
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [allRoutes, setAllRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [isDirectionRendered, setIsDirectionRendered] = useState(false);

  useEffect(() => {
    // get current user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setCurrentLocation(location);
      },
      (error) => {
        console.error("Error getting location:", error);
      },
    );
  }, []);

  useEffect(() => {
    // console.log("Carpark Details: ", carpark);
    // console.log("showDirections: ", showDirections);
  }, []);

  const Directions = ({
    origin,
    destination,
  }: {
    origin: Position;
    destination: Position;
  }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [directionsService, setDirectionsService] =
      useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] =
      useState<google.maps.DirectionsRenderer>();
    const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
    const [routeIndex, setRouteIndex] = useState(0);
    const selected = routes[routeIndex];
    const leg = selected?.legs[0];

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      if (!routesLibrary || !map) return;
      setDirectionsService(new routesLibrary.DirectionsService());
      setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [routesLibrary, map]);

    useEffect(() => {
      if (!directionsService || !directionsRenderer) return;

      if (selected) {
        directionsRenderer.setMap(map);
        return;
      }

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

    if (!leg) return null;

    return (
      <div
        className={`absolute top-2 right-2 z-10 mb-4 rounded-2xl border shadow-md transition-all duration-300 ease-in-out`}
        style={{ width: "60%" }} // Set a fixed width
      >
        <button
          onClick={() => {
            if (showDirections) setIsOpen(!isOpen);
          }}
          className="flex w-full items-center justify-between bg-white p-4 hover:bg-gray-100"
        >
          {showDirections && (
            <span className="text-sm font-semibold">{selected.summary}</span>
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

        {isOpen && showDirections && (
          <div className="max-h-60 overflow-y-auto rounded-lg bg-gray-50 p-4 shadow-inner">
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-800">
                {leg.start_address.split(",")[0]} to{" "}
                {leg.end_address.split(",")[0]}
              </p>
              <p className="text-sm text-gray-600">
                Distance:{" "}
                <span className="font-medium">{leg.distance?.text}</span>
              </p>
              <p className="text-sm text-gray-600">
                Duration:{" "}
                <span className="font-medium">{leg.duration?.text}</span>
              </p>
            </div>

            <h2 className="text-md mb-2 font-semibold text-gray-700">
              Other Routes
            </h2>
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
        )}
      </div>
    );
  };

  const MarkerWithInfoWindow = ({ position }: { position: Position }) => {
    // `markerRef` and `marker` are needed to establish the connection between
    // the marker and infowindow (if you're using the Marker component, you
    // can use the `useMarkerRef` hook instead).
    const [markerRef, marker] = useAdvancedMarkerRef();

    const [infoWindowShown, setInfoWindowShown] = useState(false);

    // clicking the marker will toggle the infowindow
    const handleMarkerClick = useCallback(
      () => setInfoWindowShown((isShown) => !isShown),
      [],
    );

    // if the maps api closes the infowindow, we have to synchronize our state
    const handleClose = useCallback(() => setInfoWindowShown(false), []);

    return (
      <>
        <AdvancedMarker
          ref={markerRef}
          position={position}
          onClick={handleMarkerClick}
        >
          <Pin
            background={getMarkerColor(Number(carpark.availableLots))}
            borderColor={getMarkerColor(Number(carpark.availableLots))}
            glyphColor={"white"}
          />
        </AdvancedMarker>

        {infoWindowShown && (
          <InfoWindow
            anchor={marker}
            onClose={handleClose}
            headerContent={<strong>{carpark.name}</strong>}
          >
            <p>Available lots: {carpark.availableLots}</p>
          </InfoWindow>
        )}
      </>
    );
  };

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultZoom={12}
          defaultCenter={{
            lat: carpark.location?.y ?? origin.lat,
            lng: carpark.location?.x ?? origin.lng,
          }}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
          fullscreenControl={false}
          streetViewControl={false}
          tiltInteractionEnabled={false}
          mapTypeControl={false}
          disableDefaultUI
        />

        {currentLocation && <GeolocationMarker position={currentLocation} />}

        {currentLocation && showDirections && (
          <Directions
            origin={currentLocation}
            destination={{
              lat: carpark.location?.y ?? origin.lat,
              lng: carpark.location?.x ?? origin.lng,
            }}
          />
        )}

        {currentLocation && (
          <MarkerWithInfoWindow
            position={{
              lat: carpark.location?.y ?? origin.lat,
              lng: carpark.location?.x ?? origin.lng,
            }}
          />
        )}

        {/* <LocateButton currentLocation={currentLocation} /> */}
      </APIProvider>
    </div>
  );
}

function getMarkerColor(availableLots: number): string {
  if (availableLots == 0) {
    return "#DC2626"; // red for no available lots
  } else if (availableLots < 20) {
    return "#F59E0B"; // amber for low availability
  } else {
    return "#10B981"; // green for good availability
  }
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
