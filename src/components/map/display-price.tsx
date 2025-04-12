import React, { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

export default function DisplayPrice({ carpark_id }) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <>
      <DisplayParkingRateInfo value={'Car'} carpark_id={carpark_id}/>
    </>
  );
}

const CarStandardRate = () => {
  return (
    <>
      <div className="font-medium text-gray-600">7:00am to 10:30pm</div>
      <div className="text-gray-800">$0.60 / 30 min</div>

      <div className="font-medium text-gray-600">10:30pm to 7:00am</div>
      <div className="text-gray-800">$0.60 / 30 min</div>
    </>
  );
};

const displayCarParkingRateInfo = () => {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      <div className="font-bold">Weekdays</div>
      <div className="text-gray-800"></div>
      <CarStandardRate />

      <div className="font-bold">Saturday</div>
      <div className="text-gray-800"></div>
      <CarStandardRate />

      <div className="font-bold">Sunday/Public Holiday</div>
      <div className="text-gray-800"></div>

      <div className="font-medium text-gray-600">10:30pm to 7:00am</div>
      <div className="text-gray-800">$0.60 / 30 min</div>
    </div>
  );
};

const displayMotorcycleParkingRateInfo = () => {
  return (
    <table className="w-full text-left text-xs text-gray-700">
      <tbody>
        <tr className="border-b">
          <th className="py-1 pr-3 font-bold text-black">Everyday</th>
          <td className="py-1 text-gray-800"></td>
        </tr>

        <tr>
          <th className="py-1 pr-3 font-medium text-gray-600">All time</th>
          <td className="py-1 text-gray-800">$0.20 / 30 min</td>
        </tr>

        <tr className="border-b">
          <th className="py-1 pr-3 font-medium text-gray-600"></th>
          <td className="py-1 text-gray-800">(capped at $0.65)</td>
        </tr>
      </tbody>
    </table>
  );
};

const displayLUBParkingRateInfo = () => {
  return (
    <table className="w-full text-left text-xs text-gray-700">
      <tbody>
        <tr className="border-b">
          <th className="py-1 pr-3 font-bold text-black">Everyday</th>
          <td className="py-1 text-gray-800"></td>
        </tr>

        <tr>
          <th className="py-1 pr-3 font-medium text-gray-600">All time</th>
          <td className="py-1 text-gray-800">Free for first 15 mins</td>
        </tr>

        <tr>
          <th className="py-1 pr-3 font-medium text-gray-600"></th>
          <td className="py-1 text-gray-800">$2 for next 30 mins</td>
        </tr>

        <tr className="border-b">
          <th className="py-1 pr-3 font-medium text-gray-600"></th>
          <td className="py-1 text-gray-800">$4 for each subsequent 30 mins</td>
        </tr>
      </tbody>
    </table>
  );
};

const CentralAreaStandardRate = () => {
  return (
    <>
      <tr>
        <th className="py-1 pr-3 font-medium text-gray-600">
          7:00am to 5:00pm
        </th>
        <td className="py-1 text-gray-800">$1.20 / 30 min</td>
      </tr>

      <tr>
        <th className="py-1 pr-3 font-medium text-gray-600">
          5:00pm to 7:00am
        </th>
        <td className="py-1 text-gray-800">$0.60 / 30 min</td>
      </tr>
    </>
  );
};

const displayCentralAreaParkingRateInfo = () => {
  return (
    <table className="w-full text-left text-xs text-gray-700">
      <tbody>
        <tr className="border-b">
          <th className="py-1 pr-3 font-bold text-black">Weekday</th>
          <td className="py-1 text-gray-800"></td>
        </tr>

        <CentralAreaStandardRate />

        <tr className="border-t border-b">
          <th className="py-1 pr-3 font-bold text-black">Saturday</th>
          <td className="py-1 text-gray-800"></td>
        </tr>

        <CentralAreaStandardRate />

        <tr className="border-t border-b">
          <th className="py-1 pr-3 font-bold text-black">
            Sunday/Public Holiday
          </th>
          <td className="py-1 text-gray-800"></td>
        </tr>

        <tr className="border-b">
          <th className="py-1 pr-3 font-medium text-gray-600">All day</th>
          <td className="py-1 text-gray-800">$0.60 / 30 min</td>
        </tr>
      </tbody>
    </table>
  );
};

const PeakHourStandardRate = ({
  startOfPeakHour,
  endOfPeakHour,
}: {
  startOfPeakHour: number;
  endOfPeakHour: number;
}) => {
  return (
    <>
      <tr>
        <th className="py-1 pr-3 font-medium text-gray-600">
        7:00am to {startOfPeakHour}:00am
        </th>
        <td className="py-1 text-gray-800">$1.20 / 30 min</td>
      </tr>

      <tr>
        <th className="py-1 pr-3 font-medium text-gray-600">
        {startOfPeakHour}:00am to {endOfPeakHour}:00pm
        </th>
        <td className="py-1 text-gray-800">$0.80 / 30 min</td>
      </tr>

      <tr>
        <th className="py-1 pr-3 font-medium text-gray-600">
        {endOfPeakHour}:00pm to 7:00am
        </th>
        <td className="py-1 text-gray-800">$0.60 / 30 min</td>
      </tr>
    </>
  );
};

const displayPeakHourParkingRateInfo = (carpark_id: string) => {
  var weekdayStartOfPeakHour = 0,
    weekdayEndOfPeakHour = 0,
    satStartOfPeakHour = 0,
    satEndOfPeakHour = 0,
    sunStartOfPeakHour = 0,
    sunEndOfPeakHour = 0;

  if (["ACB", "CY"].includes(carpark_id)) {
    weekdayStartOfPeakHour = 10;
    weekdayEndOfPeakHour = 6;
    satStartOfPeakHour = 8;
    satEndOfPeakHour = 7;
    sunStartOfPeakHour = 8;
    sunEndOfPeakHour = 7;
  } else if (["MP14", "MP15", "MP16"].includes(carpark_id)) {
    weekdayStartOfPeakHour = 8;
    weekdayEndOfPeakHour = 8;
    satStartOfPeakHour = 8;
    satEndOfPeakHour = 8;
    sunStartOfPeakHour = 8;
    sunEndOfPeakHour = 8;
  } else if (["HG9", "HG9T", "HG15", "HG16"].includes(carpark_id)) {
    weekdayStartOfPeakHour = 11;
    weekdayEndOfPeakHour = 8;
    satStartOfPeakHour = 9;
    satEndOfPeakHour = 8;
    sunStartOfPeakHour = 9;
    sunEndOfPeakHour = 8;
  } else if (carpark_id === "SE24") {
    weekdayStartOfPeakHour = 10;
    weekdayEndOfPeakHour = 10;
    satStartOfPeakHour = 10;
    satEndOfPeakHour = 10;
    sunStartOfPeakHour = 10;
    sunEndOfPeakHour = 10;
  }

  if (["SE21", "SE22"].includes(carpark_id)) {
    weekdayStartOfPeakHour = 10;
    weekdayEndOfPeakHour = 10;
    satStartOfPeakHour = 10;
    satEndOfPeakHour = 10;
    return (
      <table className="w-full text-left text-xs text-gray-700">
        <tbody>
          <tr className="border-b">
            <th className="py-1 pr-3 font-bold text-black">Weekday</th>
            <td className="py-1 text-gray-800"></td>
          </tr>
          <PeakHourStandardRate
            startOfPeakHour={weekdayStartOfPeakHour}
            endOfPeakHour={weekdayEndOfPeakHour}
          />

          <tr className="border-t border-b">
            <th className="py-1 pr-3 font-bold text-black">Saturday</th>
            <td className="py-1 text-gray-800"></td>
          </tr>

          <PeakHourStandardRate
            startOfPeakHour={weekdayStartOfPeakHour}
            endOfPeakHour={weekdayEndOfPeakHour}
          />

          <tr className="border-t border-b">
            <th className="py-1 pr-3 font-bold text-black">
              Sunday/Public Holiday
            </th>
            <td className="py-1 text-gray-800"></td>
          </tr>

          <tr className="border-b">
            <th className="py-1 pr-3 font-medium text-gray-600">
              10:30pm to 7:00am
            </th>
            <td className="py-1 text-gray-800">$0.60 / 30 min</td>
          </tr>
        </tbody>
      </table>
    );
  } else {
    return (
      <table className="w-full text-left text-xs text-gray-700">
        <tbody>
          <tr className="border-b">
            <th className="py-1 pr-3 font-bold text-black">Weekday</th>
            <td className="py-1 text-gray-800"></td>
          </tr>
          <PeakHourStandardRate
            startOfPeakHour={weekdayStartOfPeakHour}
            endOfPeakHour={weekdayEndOfPeakHour}
          />

          <tr className="border-t border-b">
            <th className="py-1 pr-3 font-bold text-black">Saturday</th>
            <td className="py-1 text-gray-800"></td>
          </tr>

          <PeakHourStandardRate
            startOfPeakHour={satStartOfPeakHour}
            endOfPeakHour={satEndOfPeakHour}
          />

          <tr className="border-t border-b">
            <th className="py-1 pr-3 font-bold text-black">
              Sunday/Public Holiday
            </th>
            <td className="py-1 text-gray-800"></td>
          </tr>
          <PeakHourStandardRate
            startOfPeakHour={sunStartOfPeakHour}
            endOfPeakHour={sunEndOfPeakHour}
          />
        </tbody>
      </table>
    );
  }
};

const DisplayParkingRateInfo = ({ value, carpark_id }: { value: string | null, carpark_id: string | null }) => {
  // https://www.hdb.gov.sg/car-parks/shortterm-parking/short-term-parking-charges

  if (value === null || value === "") return;
  if (carpark_id === "" || carpark_id === null) return

//   const carpark_id = "HG9";
  const central_area = [
    "ACB",
    "BBB",
    "BRBI",
    "CY",
    "DUXM",
    "HLM",
    "KAB",
    "KAM",
    "KAS",
    "PRM",
    "SLS",
    "SR1",
    "SR2",
    "TPM",
    "UCS",
    "WCB",
  ];

  // ACB, CY use peak hour
  const peak_hour = [
    "ACB",
    "CY",
    "SE21",
    "SE22",
    "SE24",
    "MP14",
    "MP15",
    "MP16",
    "HG9",
    "HG9T",
    "HG15",
    "HG16",
  ];

  // loading unloading bay
  const lub = [
    "GSML",
    "BRBL",
    "JCML",
    "T55",
    "GEML",
    "KAML",
    "J57L",
    "J60L",
    "TPL",
    "EPL",
    "BL8L",
  ];

  if (lub.includes(carpark_id)) {
    return displayLUBParkingRateInfo();
  }
  if (value === "Motorcycle") {
    return displayMotorcycleParkingRateInfo();
  }
  if (value === "Heavy Vehicle") {
    return "Heavy Vehicle";
  }
  if (value === "Car") {
    if (peak_hour.includes(carpark_id)) {
      return displayPeakHourParkingRateInfo(carpark_id);
    } else if (central_area.includes(carpark_id)) {
      return displayCentralAreaParkingRateInfo();
    } else {
      // normal car pricing
      return displayCarParkingRateInfo();
    }
  }
};