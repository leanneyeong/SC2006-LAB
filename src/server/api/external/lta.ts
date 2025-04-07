interface carparkAvailabilitySchema {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string;
  AvailableLots: string;
  LotType:string;
  Agency: string;
}

export const getLTACombinedCarparkAvailability = async () => {
  const url =
    "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";
  const options = {
    method: "GET",
    headers: { "AccountKey": process.env.LTA_API_KEY },
  };

  try {
    const response = await fetch(url, options);
    const json = await response.json();
    console.log(json)
  } catch (error) {
    console.log(error);
  }
};