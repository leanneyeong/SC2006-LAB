// Define allowed parking system types
export const parkingSystem = [
    'electronic', // Electronic parking system (e.g., gantry with cashcard)
    'coupon',     // Paper coupon system
    'app_based',  // Mobile app based payment
    'manual',     // Manually operated (e.g., with attendant)
    'free'        // Free parking
  ] as const;
  
  // TypeScript type for parking systems
  export type ParkingSystem = typeof parkingSystem[number];