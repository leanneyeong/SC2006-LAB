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
import { env } from "~/env";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Locate } from "lucide-react";
import { getAvailabilityThemeColor, getThemeColor } from "~/utils/get-theme-color";

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
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

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
    console.log("Carpark Details: ", carpark);
    console.log("showDirections: ", showDirections);
  }, []);

  // Function to calculate bounds that include both carpark and user location
  const getMapBounds = () => {
    if (currentLocation && carpark.location) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({lat: currentLocation.lat, lng: currentLocation.lng});
      bounds.extend({lat: carpark.location.y, lng: carpark.location.x});
      return bounds;
    }
    return null;
  };

  // Map reference to access map methods
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Fit bounds when map and locations are available
  useEffect(() => {
    if (mapRef.current && currentLocation && carpark.location) {
      const bounds = getMapBounds();
      if (bounds) {
        mapRef.current.fitBounds(bounds, {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50
        });
      }
    }
  }, [currentLocation, carpark.location]);

  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultZoom={15}
        defaultCenter={{
          lat: carpark.location?.y ?? origin.lat,
          lng: carpark.location?.x ?? origin.lng,
        }}
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        fullscreenControl={false}
        streetViewControl={false}
        tiltInteractionEnabled={false}
        mapTypeControl={false}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      />

      {currentLocation && <GeolocationMarker position={currentLocation} />}

      {/* <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <LocateButton currentLocation={currentLocation} />
      </MapControl> */}

      {showDirections && currentLocation && (
        <Directions
          origin={currentLocation}
          destination={{
            lat: carpark.location?.y ?? origin.lat,
            lng: carpark.location?.x ?? origin.lng,
          }}
          setRoutes={setRoutes}
          setRouteIndex={setRouteIndex}
          routeIndex={routeIndex}
        />
      )}

      {showDirections && (
        <DirectionDetailsCard
          routes={routes}
          routeIndex={routeIndex}
          setRouteIndex={setRouteIndex}
        />
      )}

      <AdvancedMarker
        position={{
          lat: carpark.location?.y ?? origin.lat,
          lng: carpark.location?.x ?? origin.lng,
        }}
      >
        <Pin
          background={getMarkerColor(Number(carpark.availableLots))}
          borderColor={getMarkerColor(Number(carpark.availableLots))}
          glyphColor="var(--color-primary-foreground)"
        />
      </AdvancedMarker>
    </APIProvider>
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
  //   console.log(routes);
  //   console.log(routeIndex);

  return <div>Test</div>;
};

function getMarkerColor(availableLots: number): string {
  return getAvailabilityThemeColor(availableLots);
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
        fillColor: getThemeColor("#4285F4", "hsl(var(--sidebar-primary))", "#4285F4"),
        fillOpacity: 1,
        scale: 8,
        strokeColor: getThemeColor("#FFFFFF", "hsl(var(--background))", "#FFFFFF"),
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
      <Locate className="text-gray-700 dark:text-gray-200" />
    </button>
  );
};
