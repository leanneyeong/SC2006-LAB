// pages/api/carparks.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Try one of these import paths - the one that matches your project structure
import { getAllCarparkAvailability } from '../../server/api/services/carpark-services';
// OR if your tsconfig.json has baseUrl set to "src"
// import { getAllCarparkAvailability } from 'server/api/services/carpark-services';

// Define the type for your carpark schema
interface UnifiedCarparkSchema {
  id: string;
  agency: 'HDB' | 'LTA' | 'URA';
  availableLots: number;
  // Add other properties as needed
}

type ErrorResponse = {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the carpark data
    const carparkData = await getAllCarparkAvailability();

    // Optional: Filter by query parameters
    const { agency, minLots } = req.query;
    let filteredData = carparkData.carparks as UnifiedCarparkSchema[];

    if (agency) {
      const agencyFilter = String(agency).toUpperCase();
      filteredData = filteredData.filter(carpark => carpark.agency === agencyFilter);
    }

    if (minLots) {
      const minLotsValue = parseInt(String(minLots));
      if (!isNaN(minLotsValue)) {
        filteredData = filteredData.filter(carpark => carpark.availableLots >= minLotsValue);
      }
    }

    // Optional: Update stats based on filtered data
    const stats = {
      ...carparkData.stats,
      filteredCount: filteredData.length,
      filteredAvailableLots: filteredData.reduce((sum: number, cp: UnifiedCarparkSchema) => sum + cp.availableLots, 0)
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
}