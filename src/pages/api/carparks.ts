/*import type { NextApiRequest, NextApiResponse } from 'next';

// Try one of these import paths - the one that matches your project structure
import { getAllCarparkAvailability } from '../../server/api/services/car-park-service';
// OR if your tsconfig.json has baseUrl set to "src"
// import { getAllCarparkAvailability } from 'server/api/services/carpark-services';

// Define the type for your carpark schema
interface UnifiedCarparkSchema {
  id: string;
  agency: 'HDB' | 'LTA' | 'URA';
  availableLots: number;
  // Add other properties as needed
}

// Define the structure of your stats object
interface CarparkStats {
  totalCount: number;
  totalAvailableLots: number;
  lastUpdated: string;
  // Add other stat properties as needed
}

// Define the complete response structure
interface CarparkResponse {
  carparks: UnifiedCarparkSchema[];
  stats: CarparkStats & {
    filteredCount?: number;
    filteredAvailableLots?: number;
  };
}

// Define service response type
interface CarparkServiceResponse {
  carparks: UnifiedCarparkSchema[];
  stats: CarparkStats;
}

// Define error response type
interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CarparkResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the carpark data with proper typing
    const carparkData: CarparkServiceResponse = await getAllCarparkAvailability();

    // Optional: Filter by query parameters
    const { agency, minLots } = req.query;
    let filteredData = carparkData.carparks;

    if (agency) {
      const agencyFilter = String(agency).toUpperCase() as 'HDB' | 'LTA' | 'URA';
      filteredData = filteredData.filter(carpark => carpark.agency === agencyFilter);
    }

    if (minLots) {
      const minLotsValue = parseInt(String(minLots));
      if (!isNaN(minLotsValue)) {
        filteredData = filteredData.filter(carpark => carpark.availableLots >= minLotsValue);
      }
    }

    // Calculate the sum of available lots with proper typing
    const filteredAvailableLots = filteredData.reduce((sum, cp) => sum + cp.availableLots, 0);

    // Optional: Update stats based on filtered data
    const stats = {
      ...carparkData.stats,
      filteredCount: filteredData.length,
      filteredAvailableLots
    };

    // Return the data
    return res.status(200).json({
      carparks: filteredData,
      stats
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Failed to fetch carpark data' });
  }
}*/