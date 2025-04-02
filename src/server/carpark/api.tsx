export const carparkData = require("./data.json");

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

export const formatCarparkData = (carparkData) => {
  // carpark location given in api is string
  // need to split into lat/lng and change type to float
  return carparkData.value.map(carpark => {
    const [lat, lng] = carpark.Location ? carpark.Location.split(" ").map(parseFloat) : [0, 0];
    return { ...carpark, lat, lng };
  })
}
