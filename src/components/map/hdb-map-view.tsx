"use client";

import {
  AdvancedMarker,
  APIProvider,
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Locate, InfoIcon, Star, X } from "lucide-react";
import DisplayPrice from "./display-price";
import DirectionsIcon from "@mui/icons-material/Directions";
// import InfoIcon from '@mui/icons-material/Info';

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

interface Position {
  lat: number;
  lng: number;
}

export default function HDBMapView({ carparks }) {
  const sg_center = { lat: 1.2833, lng: 103.8333 };
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [selectedCarpark, setSelectedCarpark] = useState(null);
  const [showDirection, setShowDirection] = useState(false);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

  // get current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      setCurrentLocation(location);
    });
  });

  useEffect(() => {
    // console.log(carparks);
    // console.log(selectedCarpark)
    console.log(carparks[0]);
    // console.log(carparks[0].location[0]);
  }, []);

  const DirectionButton = () => {
    const map = useMap();
    return (
      <button
        className="flex h-12 w-12 -translate-x-2 translate-y-2 transform cursor-pointer items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
        onClick={() => {
          setShowDirection(true);
          console.log(showDirection);
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
          setShowDirection(false);
          setSelectedCarpark(null);
        }}
      >
        <X />
      </button>
    );
  };

  return (
    <div>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <div style={{ width: "100%", height: "70vh" }}>
          <Map
            defaultZoom={12}
            defaultCenter={sg_center}
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
            fullscreenControl={false}
            streetViewControl={false}
            tiltInteractionEnabled={false}
          >
            {/* current location marker & button */}
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
              <LocateButton currentLocation={currentLocation} />
            </MapControl>

            {currentLocation && (
              <GeolocationMarker position={currentLocation} />
            )}

            {/* carpark markers */}
            <CarparkMarkers
              carparks={carparks}
              setSelectedCarpark={setSelectedCarpark}
              selectedCarpark={selectedCarpark}
              setShowDirection={setShowDirection}
              showDirection={showDirection}
            />

            <MapControl position={ControlPosition.TOP_RIGHT}>
              <CarparkDropdown carpark={selectedCarpark} />
            </MapControl>

            {/* buttons */}
            {selectedCarpark && (
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
            )}

            {/* show directions */}
            {showDirection && selectedCarpark && currentLocation && (
              <Directions
                origin={currentLocation}
                destination={{
                  lat: selectedCarpark.lat,
                  lng: selectedCarpark.lng,
                }}
                // setRoutes={setRoutes}
                // setRouteIndex={setRouteIndex}
                // routeIndex={routeIndex}
              />
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}

const Directions = ({ origin, destination }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
      });

    return () => directionsRenderer.setDirections(null);
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
};

const CarparkMarkers = ({
  carparks,
  setSelectedCarpark,
  selectedCarpark,
  setShowDirection,
  showDirection,
}) => {
  const map = useMap();
  return (
    <>
      {carparks.map((carpark) => {
        const isSelected = selectedCarpark?.carParkNo === carpark.carParkNo;

        return (
          <React.Fragment key={carpark.carParkNo}>
            <AdvancedMarker
              title={carpark.carParkNo}
              position={{
                lat: carpark.location[1],
                lng: carpark.location[0],
              }}
              onClick={() => {
                setSelectedCarpark(carpark);
                setShowDirection(false);
                console.log(showDirection);
                map?.panTo({
                  lat: carpark.location[1],
                  lng: carpark.location[0],
                });
              }}
            />

            {isSelected && (
              <InfoWindow
                position={{
                  lat: carpark.location[1],
                  lng: carpark.location[0],
                }}
                onCloseClick={() => {}}
                headerContent={<h2 className="font-bold">{carpark.name}</h2>}
              >
                <p>Distance: {carpark.distance}</p>
                <p>Available Lots: {carpark.availableLots}</p>
              </InfoWindow>
            )}
          </React.Fragment>
        );
      })}
    </>
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
      className="flex h-11 w-11 -translate-x-2 transform cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 hover:shadow-lg focus:outline-none"
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
