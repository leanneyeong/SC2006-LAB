import dotenv from 'dotenv';
dotenv.config();

// Define interfaces for each data source
interface HDBCarparkSchema {
  carpark_number: string;
  carpark_info: HDBLotSchema[];
}

interface HDBLotSchema {
  total_lots: string;
  lot_type: string;
  lots_available: string;
}

interface LTACarparkSchema {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: string;
  LotType: string;
  Agency: string;
}

interface URACarparkSchema {
  carparkNo: string;
  geometries: {
    coordinates: string;
  }[];
  lotsAvailable: string;
  lotType: string;
}

// Define a unified schema for storing data from all sources
interface UnifiedCarparkSchema {
  id: string;
  agency: 'HDB' | 'LTA' | 'URA';
  name?: string;
  area?: string;
  location?: string;
  coordinates?: { lat: number; lng: number } | null;
  availableLots: number;
  totalLots?: number;
  lotType: string;
  lastUpdated: string;
}

// Mapping of HDB block ranges to areas in Singapore
const hdbEstateMap: Record<string, string> = {
  '1-50': 'Tiong Bahru',
  '51-82': 'Commonwealth',
  '83-95': 'Redhill',
  '96-116': 'Bukit Merah',
  '117-131': 'Queenstown',
  '132-162': 'Queenstown',
  '163-227': 'Bukit Merah',
  '230-235': 'Tiong Bahru',
  '236-315': 'Tiong Bahru',
  '316-329': 'Queenstown',
  '330-357': 'Bukit Merah',
  '401-409': 'Ang Mo Kio',
  '410-428': 'Toa Payoh',
  '435-458': 'MacPherson',
  '462-468': 'Geylang East',
  '469-470': 'Geylang East',
  '471-473': 'MacPherson',
  '474-476': 'Bedok',
  '477-486': 'Tampines',
  '487-500': 'Bedok',
  '501-507': 'Bedok',
  '508-511': 'Bedok',
  '512-565': 'Bedok',
  '566-586': 'Pasir Ris',
  '587-595': 'Pasir Ris',
  '596-598': 'Pasir Ris',
  '601-612': 'Ang Mo Kio',
  '613-631': 'Bukit Panjang',
  '632-639': 'Bukit Panjang',
  '640-645': 'Bukit Panjang',
  '646-649': 'Hougang',
  '650-697': 'Jurong West',
  '701-711': 'Yishun',
  '712-716': 'Woodlands',
  '717-732': 'Clementi',
  '733-742': 'Toa Payoh',
  '743-746': 'Boon Lay',
  '747-751': 'Pasir Ris',
  '752-761': 'Tampines',
  '762-765': 'Tampines',
  '766-769': 'Tampines',
  '770-773': 'Tampines',
  '774-781': 'Tampines',
  '782-787': 'Tampines',
  '801-811': 'Kreta Ayer',
  '812-824': 'Kreta Ayer',
  '825-829': 'Queenstown',
  '830-833': 'Kallang Basin',
  '834-857': 'Geylang East',
  '858-861': 'Geylang East',
  '862-866': 'Geylang East',
  '867-876': 'Tampines',
  '877-882': 'Tampines',
  '883-888': 'Tampines',
  '889-899': 'Tampines',
  '901-913': 'Kallang Basin',
  '914-918': 'Kallang Basin',
  '919-933': 'Hougang',
  '934-956': 'Hougang',
  '957-962': 'Hougang',
  '963-966': 'Bukit Panjang',
};

// HDB carpark ID to specific location mapping
const hdbLocationMap: Record<string, { area: string, name?: string }> = {
  // Specific block mappings
  '37': { area: 'Holland Drive', name: 'Holland Drive Block 37' },
  '50': { area: 'Commonwealth Drive', name: 'Commonwealth Drive Block 50' },
  '51': { area: 'Commonwealth Drive', name: 'Commonwealth Drive Block 51' },
  '43': { area: 'Holland Drive', name: 'Holland Drive Block 43' },
  '15': { area: 'Dover Road', name: 'Dover Road Block 15' },
  '16': { area: 'Dover Road', name: 'Dover Road Block 16' },
  '17': { area: 'Dover Crescent', name: 'Dover Crescent Block 17' },
  '18': { area: 'Dover Crescent', name: 'Dover Crescent Block 18' },
  '9': { area: 'Queen\'s Road', name: 'Queen\'s Road Block 9' },
  
  // More specific HDB carparks
  'HE12': { area: 'Woodlands', name: 'Woodlands Central' },
  'HLM': { area: 'Hougang', name: 'Hougang Ave 10' },
  'RHM': { area: 'Redhill', name: 'Redhill Market' },
  'BM29': { area: 'Bukit Merah', name: 'Bukit Merah Central' },
  'Q81': { area: 'Queenstown', name: 'Queenstown Blk 81' },
  'C20': { area: 'Clementi', name: 'Clementi West Street 2' },
  'FR3M': { area: 'Farrer Road', name: 'Farrer Road Market' },
  'C32': { area: 'Chinatown', name: 'Chinatown Complex' },
};

// Helper function to find area for HDB block number
const findAreaForHDBBlock = (blockId: string): string => {
  // First check specific mappings
  if (hdbLocationMap[blockId]) {
    return hdbLocationMap[blockId].area;
  }
  
  // Try to extract numeric portion for block-based areas
  const numericId = blockId.replace(/\D/g, '');
  if (numericId && hdbLocationMap[numericId]) {
    return hdbLocationMap[numericId].area;
  }
  
  // If it's a pure numeric ID, check block ranges
  if (/^\d+$/.test(blockId)) {
    const blockNum = parseInt(blockId);
    for (const [range, area] of Object.entries(hdbEstateMap)) {
      const [start, end] = range.split('-').map(Number);
      if (blockNum >= start && blockNum <= end) {
        return area;
      }
    }
  }
  
  // Location codes for common areas
  const locationCodes: Record<string, string> = {
    'AM': 'Ang Mo Kio',
    'BB': 'Bukit Batok',
    'BD': 'Bedok',
    'BH': 'Bishan',
    'BM': 'Bukit Merah',
    'BP': 'Bukit Panjang',
    'BT': 'Bukit Timah',
    'CC': 'Choa Chu Kang',
    'CE': 'Clementi',
    'GE': 'Geylang',
    'HG': 'Hougang',
    'JE': 'Jurong East',
    'JW': 'Jurong West',
    'KL': 'Kallang',
    'MP': 'Marine Parade',
    'PG': 'Punggol',
    'QT': 'Queenstown',
    'SK': 'Sengkang',
    'SL': 'Sembawang',
    'TG': 'Tanglin',
    'TP': 'Tampines',
    'WD': 'Woodlands',
    'YS': 'Yishun'
  };
  
  // Try to match location codes
  for (const [code, area] of Object.entries(locationCodes)) {
    if (blockId.startsWith(code)) {
      return area;
    }
  }
  
  return 'Singapore'; // Default fallback
};

// Helper function to generate a name for HDB carparks
const generateHDBCarparkName = (blockId: string): string | undefined => {
  // Check specific mappings first
  if (hdbLocationMap[blockId] && hdbLocationMap[blockId].name) {
    return hdbLocationMap[blockId].name;
  }
  
  // For pure numeric IDs, check if we have a specific mapping
  const numericId = blockId.replace(/\D/g, '');
  if (numericId && hdbLocationMap[numericId] && hdbLocationMap[numericId].name) {
    return hdbLocationMap[numericId].name;
  }
  
  // We'll let the UI handle name generation for other cases
  return undefined;
};

// Function to fetch HDB carpark data
export const getHDBCarparkAvailability = async (): Promise<UnifiedCarparkSchema[]> => {
  const url = "https://api.data.gov.sg/v1/transport/carpark-availability";
  const options = { method: "GET" };
  const results: UnifiedCarparkSchema[] = [];

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    const items = data.items[0];
    const timestamp = items.timestamp; // ISO string of the timestamp
    const carpark_data = items.carpark_data;

    carpark_data.forEach((carpark: HDBCarparkSchema) => {
      const carpark_id = carpark.carpark_number;
      
      // Determine area based on carpark ID
      const area = findAreaForHDBBlock(carpark_id);
      
      // Generate name if possible
      const name = generateHDBCarparkName(carpark_id);

      carpark.carpark_info.forEach((lot: HDBLotSchema) => {
        results.push({
          id: carpark_id,
          agency: 'HDB',
          name: name,
          area: area,
          availableLots: parseInt(lot.lots_available) || 0,
          totalLots: parseInt(lot.total_lots) || 0,
          lotType: lot.lot_type,
          lastUpdated: timestamp
        });
      });
    });

    return results;
  } catch (error) {
    console.error("Error fetching HDB carpark data:", error);
    return [];
  }
};

// Function to fetch LTA carpark data
export const getLTACarparkAvailability = async (): Promise<UnifiedCarparkSchema[]> => {
  const url = "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";
  const options = {
    method: "GET",
    headers: { "AccountKey": process.env.LTA_API_KEY as string },
  };
  const results: UnifiedCarparkSchema[] = [];

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    const timestamp = new Date().toISOString();

    json.value.forEach((carpark: LTACarparkSchema) => {
      results.push({
        id: carpark.CarParkID,
        agency: 'LTA',
        name: carpark.Development,
        area: carpark.Area,
        location: carpark.Location,
        availableLots: parseInt(carpark.AvailableLots) || 0,
        lotType: carpark.LotType,
        lastUpdated: timestamp
      });
    });

    return results;
  } catch (error) {
    console.error("Error fetching LTA carpark data:", error);
    return [];
  }
};

// Function to fetch URA carpark data
export const getURACarparkAvailability = async (): Promise<UnifiedCarparkSchema[]> => {
  const url = "https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability";
  const options = {
    method: "GET",
    headers: {
      "AccessKey": process.env.URA_ACCESS_KEY as string,
      "Token": process.env.URA_TOKEN as string,
      "User-Agent": "curl/7.68.0",
    },
  };
  const results: UnifiedCarparkSchema[] = [];

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const timestamp = new Date().toISOString();

    // Handle URA's specific response structure
    if (data.Result && Array.isArray(data.Result)) {
      data.Result.forEach((carpark: URACarparkSchema) => {
        // Try to parse coordinates if available
        let coordinates = null;
        if (carpark.geometries && carpark.geometries[0] && carpark.geometries[0].coordinates) {
          try {
            const coordStr = carpark.geometries[0].coordinates;
            const [lng, lat] = coordStr.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = { lat, lng };
            }
          } catch (e) {
            console.error("Error parsing URA coordinates", e);
          }
        }

        results.push({
          id: carpark.carparkNo,
          agency: 'URA',
          area: 'Urban Redevelopment Area', // Default area for URA carparks
          coordinates,
          availableLots: parseInt(carpark.lotsAvailable) || 0,
          lotType: carpark.lotType,
          lastUpdated: timestamp
        });
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching URA carpark data:", error);
    return [];
  }
};

// Main function to fetch data from all sources
export const getAllCarparkAvailability = async (): Promise<{
  carparks: UnifiedCarparkSchema[],
  stats: {
    totalCarparks: number,
    totalAvailableLots: number,
    byAgency: {
      HDB: number,
      LTA: number,
      URA: number
    }
  }
}> => {
  try {
    // Fetch data from all sources concurrently
    const [hdbData, ltaData, uraData] = await Promise.all([
      getHDBCarparkAvailability(),
      getLTACarparkAvailability(),
      getURACarparkAvailability()
    ]);

    // Combine all data
    const allCarparks = [...hdbData, ...ltaData, ...uraData];

    // Calculate some basic statistics
    const stats = {
      totalCarparks: allCarparks.length,
      totalAvailableLots: allCarparks.reduce((sum: number, cp: UnifiedCarparkSchema) => sum + (cp.availableLots || 0), 0),
      byAgency: {
        HDB: hdbData.length,
        LTA: ltaData.length,
        URA: uraData.length
      }
    };

    return {
      carparks: allCarparks,
      stats
    };
  } catch (error) {
    console.error("Error fetching combined carpark data:", error);
    return {
      carparks: [],
      stats: {
        totalCarparks: 0,
        totalAvailableLots: 0,
        byAgency: { HDB: 0, LTA: 0, URA: 0 }
      }
    };
  }
};