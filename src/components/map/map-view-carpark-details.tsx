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
import { Locate } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function MapViewCarparkDetails() {
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // get current user location
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      console.log("Current Location:", location);
      setCurrentLocation(location);
    });
  }, []);

  return (
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <Map
          defaultZoom={12}
          defaultCenter={origin}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
        />
          <MapControl position={ControlPosition.RIGHT_BOTTOM}>
            <LocateButton currentLocation={currentLocation} />
          </MapControl>

          <GeolocationMarker position={currentLocation} />
      </APIProvider>
  );
}

const GeolocationMarker = ({ position }) => {
  // https://github.com/visgl/react-google-maps/discussions/552
  const map = useMap();

  const geolocationMarker = useMemo(() => {
    if (!map) return null;

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
    if (geolocationMarker) {
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

const LocateButton = ({ currentLocation }) => {
  const map = useMap();
  return (
    <button
      className="flex h-12 w-12 -translate-x-1 transform cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 hover:shadow-lg focus:outline-none"
      onClick={() => {
        map?.panTo(currentLocation);
        map?.setZoom(15);
      }}
    >
      <Locate />
    </button>
  );
};
