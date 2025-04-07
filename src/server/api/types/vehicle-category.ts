// Define allowed vehicle categories
export const vehicleCategory = [
    'car',
    'motorcycle',
    'heavy_vehicle',
    'bicycle',
    'electric_vehicle'
  ] as const;
  
  // TypeScript type for vehicle categories
  export type VehicleCategory = typeof vehicleCategory[number];