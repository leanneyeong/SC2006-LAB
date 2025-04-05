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
import { HeadingIcon, Locate } from "lucide-react";
import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { carparkData, formatCarparkData } from "~/server/carpark/api";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";

export default function MapView() {
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [openWindowOrigin, setOpenWindowOrigin] = useState(false);
  const [carparks, setCarparks] = useState([]);
  const [selectedCarpark, setSelectedCarpark] = useState(null);
  const [showDirection, setShowDirection] = useState(false);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    setCarparks(formatCarparkData(carparkData));
    // console.log(carparks)

    // get current user location
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      console.log("Current Location:", location);
      setCurrentLocation(location);
    });
  }, []);

  return (
    <div>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <div style={mapStyle}>
          <Map
            defaultZoom={12}
            defaultCenter={origin}
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
          >
            <MapControl position={ControlPosition.RIGHT_BOTTOM}>
              <button
                className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md hover:shadow-lg focus:outline-none cursor-pointer transform -translate-x-1 transition-transform duration-200"
                onClick={()=>{}}
              >
                <Locate />
              </button>
            </MapControl>

            <GeolocationMarker position={currentLocation} />

            {/* Origin Marker Component */}
            {/* <OriginMarker
              position={origin}
              openWindow={openWindowOrigin}
              onClick={() => setOpenWindowOrigin(true)}
              onClose={() => {
                setOpenWindowOrigin(false);
              }}
            /> */}

            {/* Carpark Markers Component */}
            <CarparksMarker
              carparks={carparks}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={setSelectedCarpark}
              onShowDirection={setShowDirection}
            />

            {showDirection && selectedCarpark && (
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

const Directions = ({
  origin,
  destination,
  setRoutes,
  setRouteIndex,
  routeIndex,
}) => {
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
        setRoutes(response.routes);
      });
    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer]);

  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  });

  return null;
};

const DirectionDetailsCard = ({ routes, routeIndex, setRouteIndex }) => {
  console.log(routes);
  console.log(routeIndex);

  // sometimes api got problem, idk why but this works
  if (routes.length === 0) return;

  const selectedRoute = routes[routeIndex];
  const leg = selectedRoute?.legs[0];

  routes.map((route, index) => {
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
            <li>
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

// 🆕 OriginMarker Component
const OriginMarker = ({ position, openWindow, onClick, onClose }) => {
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
const CarparksMarker = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  onShowDirection,
}) => {
  return (
    <>
      {carparks.map((carpark) => (
        <React.Fragment key={carpark.CarParkID}>
          <AdvancedMarker
            position={{ lat: carpark.lat, lng: carpark.lng }}
            onClick={() => onSelectCarpark(carpark)}
          />

          {selectedCarpark &&
            selectedCarpark.CarParkID === carpark.CarParkID && (
              <InfoWindow
                position={{ lat: carpark.lat, lng: carpark.lng }}
                headerContent={
                  <strong>{carpark.Development || "Unknown Carpark"}</strong>
                }
                onCloseClick={() => {
                  // onSelectCarpark(null);
                  // onShowDirection(false);
                  // console.log("showDirection: false");
                }}
              >
                <div style={{ color: "black" }}>
                  <p>
                    <strong>Area:</strong> {carpark.Area || "N/A"}
                  </p>
                  <p>
                    <strong>Available Lots:</strong>{" "}
                    {carpark.AvailableLots || "Unknown"}
                  </p>
                  <p>
                    <strong>Agency:</strong> {carpark.Agency || "N/A"}
                  </p>
                </div>
              </InfoWindow>
            )}
        </React.Fragment>
      ))}
    </>
  );
};

const CarparkDetailsCard = ({ carpark, onClose, onShowDirection }) => {
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
        <Button className="mt-4 bg-blue-500 text-white hover:bg-blue-600">
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
        <h3 className="mb-2 text-xl font-bold">{carpark.Development}</h3>
        <p>
          <span className="font-medium">Area:</span> {carpark.Area || "N/A"}
        </p>
        <p>
          <span className="font-medium">Availability:</span>{" "}
          {carpark.AvailableLots || "Unknown"}
        </p>
        <p>
          <span className="font-medium">Lot Type:</span>{" "}
          {carpark.LotType || "Unknown"}
        </p>
        <p>
          <span className="font-medium">Agency:</span> {carpark.Agency || "N/A"}
        </p>
      </CardContent>
    </div>
  );
};

const mapStyle = {
  width: "100%",
  height: "70vh",
};

const directions = {
  width: "20vw",
  height: "20vh",
};
