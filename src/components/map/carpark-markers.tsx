"use client";

import { AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import React from "react";
import { RouterOutputs } from "~/utils/api";
import getAvailabilityColour from "~/utils/get-availability-colour";
import getDistanceBetweenCarPark from "~/utils/get-distance-between-carpark";
import { getAvailabilityThemeColor, getThemeColor } from "~/utils/get-theme-color";

type CarparkData = RouterOutputs["carPark"]["getCarparks"][number];

interface CarparksMarkerProps {
  carparks: CarparkData[];
  selectedCarpark: CarparkData | null;
  onSelectCarpark: (carpark: CarparkData) => void;
  onShowDirection?: (show: boolean) => void;
}

export const CarparksMarker = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
}: CarparksMarkerProps) => {
  if (!carparks || carparks.length === 0) {
    return null;
  }

  //Sort carparks by distance
  const nearestCarparks = [...carparks].sort((a,b) => {
    const distanceA = Number(getDistanceBetweenCarPark(a.location));
    const distanceB = Number(getDistanceBetweenCarPark(b.location));
    return distanceA - distanceB
  });

  return (
    <>
      {nearestCarparks.map((carpark) => (
        <React.Fragment key={carpark.carParkNo ?? carpark.id}>
          <AdvancedMarker
            position={{ lat: carpark.location.y, lng: carpark.location.x }}
            onClick={() => onSelectCarpark(carpark)}
            title={carpark.address || "Unknown Carpark"}
            clickable={true}
          >
            <div 
              onClick={() => onSelectCarpark(carpark)}
              style={{ cursor: 'pointer' }}
            >
              <Pin 
                background={getMarkerColor(carpark.availableLots)} 
                borderColor={getMarkerColor(carpark.availableLots)}
                glyphColor="white"
              />
            </div>
          </AdvancedMarker>

          {selectedCarpark &&
            selectedCarpark.carParkNo === carpark.carParkNo && (
              <InfoWindow
                position={{ lat: carpark.location.y, lng: carpark.location.x }}
                headerContent={
                  <strong style={{ color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827' }}>
                    {carpark.address || "Unknown Carpark"}
                  </strong>
                }
              >
                <div style={{ 
                  color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  <p>Distance: {getDistanceBetweenCarPark(carpark.location)} km</p>
                  <p>Available Lots: <span className={getAvailabilityColour(carpark.availableLots)}>
                    {carpark.availableLots}
                  </span></p>
                </div>
              </InfoWindow>       
            )}
        </React.Fragment>
      ))}
    </>
  );
};

function getMarkerColor(availableLots: number): string {
  return getAvailabilityThemeColor(availableLots);
}

export default CarparksMarker;