"use client";

import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  Pin,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { HeadingIcon } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import { carparkData, formatCarparkData } from "~/server/carpark/api";

export default function MapView() {
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [openWindowOrigin, setOpenWindowOrigin] = useState(false);
  const [carparks, setCarparks] = useState([]);
  const [selectedCarpark, setSelectedCarpark] = useState(null);
  const [showDirection, setShowDirection] = useState(false);

  useEffect(() => {
    setCarparks(formatCarparkData(carparkData));
    // console.log(carparks)
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
            {/* Origin Marker Component */}
            <OriginMarker
              position={origin}
              openWindow={openWindowOrigin}
              onClick={() => setOpenWindowOrigin(true)}
              onClose={() => {
                setOpenWindowOrigin(false);
              }}
            />

            {/* Carpark Markers Component */}
            <CarparksMarker
              carparks={carparks}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={setSelectedCarpark}
              onShowDirection={setShowDirection}
            />

            {showDirection && selectedCarpark && (
              <Directions origin={origin} destination={selectedCarpark} />
            )}
          </Map>
        </div>
      </APIProvider>

      {/* Carpark Details Card - Only Shown When a Carpark is Selected */}
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
  );
}

const Directions = ({ origin, destination }) => {
  const map = useMap();
  const maps = useMapsLibrary("routes");
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  useEffect(() => {
    if (!maps || !map || !destination) return;
    const directionsService = new maps.DirectionsService();
    const renderer = new maps.DirectionsRenderer({ map });
    setDirectionsRenderer(renderer);

    directionsService.route(
      {
        origin,
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: "DRIVING",
      },
      (result, status) => {
        if (status === "OK") {
          renderer.setDirections(result);
        }
      },
    );

    return () => renderer.setMap(null);
  }, [maps, map, destination]);

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
                onCloseClick={() => {
                  onSelectCarpark(null);
                  onShowDirection(false);
                  console.log("showDirection: false");
                }}
              >
                <div style={{ color: "black" }}>
                  <h1 style={{ marginBottom: "5px" }}>
                    <strong>{carpark.Development || "Unknown Carpark"}</strong>
                  </h1>
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
        width: "100%",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        textAlign: "left",
      }}
    >
      <h2 style={{ marginBottom: "10px", color: "#333", fontSize: "18px" }}>
        {carpark.Development}
      </h2>
      <p>
        <strong>Area:</strong> {carpark.Area || "N/A"}
      </p>
      <p>
        <strong>Available Lots:</strong> {carpark.AvailableLots || "Unknown"}
      </p>
      <p>
        <strong>Lot Type:</strong> {carpark.LotType || "Unknown"}
      </p>
      <p>
        <strong>Agency:</strong> {carpark.Agency || "N/A"}
      </p>

      {/* Buttons - Close (Left) & Show Direction (Right) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "10px",
        }}
      >
        <button
          style={{
            padding: "8px 12px",
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

        <button
          style={{
            padding: "8px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "14px",
          }}
          onClick={() => {
            onShowDirection(true);
            console.log("showDirection: true");
          }}
        >
          Show Direction
        </button>
      </div>
    </div>
  );
};

const mapStyle = {
  width: "100%",
  height: "60vh",
};

const directions = {
  width: "20vw",
  height: "20vh",
};
