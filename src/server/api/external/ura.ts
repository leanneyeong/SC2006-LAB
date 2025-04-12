/*import type { NextApiRequest, NextApiResponse } from "next";

interface carparkAvailabilitySchema {
  carparkNo: string;
  geometries: {
    coordinates: string;
  }[];
  lotsAvailable: string;
  lotType: string;
}

export const getURACarparkAvailability = async () => {
  const url =
    "https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=Car_Park_Availability";
  const options = {
    method: "GET",
    headers: {
      "AccessKey": process.env.URA_ACCESS_KEY,
      "Token": process.env.URA_TOKEN,
      "User-Agent": "curl/7.68.0",  // << add this
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data)
  } catch (error) {
    console.log(error);
  }
};