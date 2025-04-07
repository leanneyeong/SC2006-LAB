interface carparkAvailabilitySchema {
  carpark_number: string;
  carpark_info: LotSchema[];
}

interface LotSchema {
  total_lots: string; // or number, depending on actual API type
  lot_type: string; // e.g., "C", "Y", "H" (could also make this a union type)
  lots_available: string; // or number
}

export const getHDBCarparkAvailability = async () => {
  const url = "https://api.data.gov.sg/v1/transport/carpark-availability";
  const options = { method: "GET" };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    const items = data["items"][0];
    const timestamp = items["timestamp"]; // ISO string of the timestamp
    const carpark_data = items["carpark_data"];
    console.log(carpark_data)

    carpark_data.map((carpark: carparkAvailabilitySchema) => {
      const carpark_id = carpark["carpark_number"];
      const carpark_info = carpark["carpark_info"];

      carpark_info.map((lots: LotSchema) => {
        const total_lots = lots["total_lots"];
        const lots_available = lots["lots_available"];
        const lot_type = lots["lot_type"];
      });
    });
  } catch (error) {
    console.error(error);
  }
};


