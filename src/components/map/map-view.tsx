"use client";

import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  Pin,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { carparkData, formatCarparkData } from "~/server/carpark/api";

export default function MapView() {
  const origin = { lat: 1.2833, lng: 103.8333 };
  const [openWindowOrigin, setOpenWindowOrigin] = useState(false);
  const [carparks, setCarparks] = useState([]);
  const [selectedCarpark, setSelectedCarpark] = useState(null);

  useEffect(() => {
    setCarparks(formatCarparkData(carparkData));
    // console.log(carparks)
  }, []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <div style={mapStyle}>
        <Map
          defaultZoom={12}
          defaultCenter={origin}
          mapId={process.env.NEXT_PUBLIC_MAP_ID}
        >
          {/* Origin Marker */}
          <AdvancedMarker
            position={origin}
            onClick={() => setOpenWindowOrigin(true)}
          >
            <Pin
              background={"green"}
              borderColor={"green"}
              glyphColor={"white"}
            />
          </AdvancedMarker>

          {openWindowOrigin && (
            <InfoWindow
              position={origin}
              onCloseClick={() => setOpenWindowOrigin(false)}
            >
              <p style={{ color: "black" }}>Origin</p>
            </InfoWindow>
          )}

          {/* Carpark Marker */}
          {carparks.map((carpark) => (
            <AdvancedMarker
              position={{ lat: carpark.lat, lng: carpark.lng }}
              onClick={() => setSelectedCarpark(carpark)}
            />
          ))}

          {selectedCarpark && (
            <InfoWindow
              position={{ lat: selectedCarpark.lat, lng: selectedCarpark.lng }}
              onCloseClick={() => setSelectedCarpark(null)}
            >
                <div style={{color:"black"}}>
              <h1 style={{ marginBottom: "5px"}}>
                <strong>{selectedCarpark.Development || "Unknown Carpark"}</strong>
              </h1>
              <p><strong>Area:</strong> {selectedCarpark.Area || "N/A"}</p>
              <p><strong>Available Lots:</strong> {selectedCarpark.AvailableLots || "Unknown"}</p>
              <p><strong>Agency:</strong> {selectedCarpark.Agency || "N/A"}</p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

const mapStyle = {
  width: "100%",
  height: "60vh",
};
