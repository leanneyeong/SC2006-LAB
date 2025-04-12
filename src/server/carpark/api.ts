/**
 * Represents a car park location in Singapore
 */
interface CarParkInfo {
  /** Unique identifier for the car park */
  CarParkID: string;
  
  /** Area where the car park is located (e.g., "Marina", "Orchard", "Harbfront") */
  Area: string;
  
  /** Name of the development or building where the car park is located */
  Development: string;
  
  /** Geographic coordinates of the car park (latitude and longitude as string) */
  Location: string;
  
  /** Number of available parking lots */
  AvailableLots: number;
  
  /** Type of parking lot (e.g., "C" for cars, "H" and "Y" for other vehicle types) */
  LotType: string;
  
  /** Agency managing the car park (e.g., "LTA", "HDB", "URA") */
  Agency: string;
}

/**
 * Root structure of the car park availability data
 */
interface CarParkAvailabilityResponse {
  /** OData metadata URL */
  "odata.metadata": string;
  
  /** Array of car park information objects */
  value: CarParkInfo[];
}

export const carparkData = require("./data.json") as CarParkAvailabilityResponse;

export const getCarparkAvailability = async () => {
  // get carpark availability data from LTA Datamall API
  const LTA_API_KEY = "8AEv+OxXR1CFUZ+NJS8kag==";
  const url =
    "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { AccountKey: LTA_API_KEY },
    });
    const json = await response.json();
    // console.log(json);
    // console.log(json.value[0])
    return json;
  } catch (error) {
    console.log(error);
  }
};

export const getUpdatedAvailabilityLot = () => {
  // const carparkData = await getCarparkAvailability();
  return carparkData.value.map(carpark => {
    return {
      CarParkID: carpark.CarParkID,
      LotType: carpark.LotType,
      AvailableLots: carpark.AvailableLots,
    }
  })
}

export const formatCarparkData = (carparkData : CarParkAvailabilityResponse) => {
  // carpark location given in api is string
  // need to split into lat/lng and change type to float
  return carparkData.value.map(carpark => {
    const [lat, lng] = carpark.Location ? carpark.Location.split(" ").map(parseFloat) : [0, 0];
    return { ...carpark, lat, lng };
  })
}
