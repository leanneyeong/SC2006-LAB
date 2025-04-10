interface carparkAvailabilitySchema {
  carpark_number: string;
  carpark_info: LotSchema[];
}

interface LotSchema {
  total_lots: string; // or number, depending on actual API type
  lot_type: string; // e.g., "C", "Y", "H" (could also make this a union type)
  lots_available: string; // or number
}


// use this for every refresh
export const updateCarparkAvailability = async () => {
  const url = "https://api.data.gov.sg/v1/transport/carpark-availability";
  const options = { method: "GET" };
  const default_lot_types = ["C", "M", "H"];
  console.log('update hdb carpark availability:')

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    const items = data["items"][0];
    const update_datetime = items["update_datetime"]; // ISO string of the timestamp
    const carpark_data = items["carpark_data"];

    carpark_data.map((carpark: carparkAvailabilitySchema) => {
      const carpark_id = carpark["carpark_number"];
      const carpark_info = carpark["carpark_info"];

      const default_lots = {
        C: { lots_available: 0, total_lots: 0 },
        M: { lots_available: 0, total_lots: 0 },
        H: { lots_available: 0, total_lots: 0 },
      };

      carpark_info.map((lots: LotSchema) => {
        const total_lots = parseInt(lots["total_lots"], 10);
        const lots_available = parseInt(lots["lots_available"]);
        const lot_type = lots["lot_type"];

        if (default_lot_types.includes(lot_type)) {
            default_lots[lot_type].lots_available = lots_available;
            default_lots[lot_type].total_lots = total_lots;

            // connect to db here to run sql
            // INSERT INTO availability_lot (lots_available, total_lots, update_datetime)
            // VALUES (lots_available, total_lots, update_datetime)
        }
      });
    });
  } catch (error) {
    console.error(error);
  }
};
