import { useMemo } from "react";

import {
  useHistoricalDataRange,
  useHistoricalDistinctLGAs,
  useHistoricalMonthlyOccupancyADRPerLGA,
  useHistoricalSingleLGAHistOccLOS,
} from "../API/historicalApi";

import {
  useLengthDataRange,
  useLengthDistinctLGAs,
  useLengthMonthlyLOSBWPerLGA,
  useLengthAvgLOSandBWByLGA,
} from "../API/lengthApi";

export default function useSharedData(lga, lga2) {
  // historical API
  const historicalRange = useHistoricalDataRange();
  const distinctLGAs = useHistoricalDistinctLGAs();
  const monthlyOccADRPerLGA = useHistoricalMonthlyOccupancyADRPerLGA();
  const hist1 = useHistoricalSingleLGAHistOccLOS(lga);
  const hist2 = useHistoricalSingleLGAHistOccLOS(lga2);

  // length API
  const lengthRange = useLengthDataRange();
  const lengthLGAs = useLengthDistinctLGAs();
  const lengthMonthly = useLengthMonthlyLOSBWPerLGA();
  const len1 = useLengthAvgLOSandBWByLGA(lga);
  const len2 = useLengthAvgLOSandBWByLGA(lga2);

  // loading state
  const loading =
    historicalRange.loading ||
    lengthRange.loading ||
    !historicalRange.data?.Data ||
    !lengthRange.data?.Data;

  // LGA list
  const lgaList = distinctLGAs.data?.Data?.map((item) => item.lga_name) || [];
  const allLgaList = [...lgaList, "All Regions"];

  // Ranking
  const rankingOptions = [
    "Occupancy Rate",
    "Daily Rate",
    "Length of Stay",
    "Booking Window",
  ];


  // year calculation (same logic as before)
  const years = useMemo(() => {
    if (loading) return [];

    const h = historicalRange.data.Data[0];
    const l = lengthRange.data.Data[0];

    const min = new Date(Math.min(new Date(h.min_date), new Date(l.min_date)));
    const max = new Date(Math.max(new Date(h.max_date), new Date(l.max_date)));

    const arr = [];
    for (let y = min.getFullYear(); y <= max.getFullYear(); y++) {
      arr.push(y);
    }
    return arr;
  }, [loading]);

const { minDate, maxDate } = useMemo(() => {
  if (loading) return { minDate: null, maxDate: null };

  const h = historicalRange.data.Data[0];
  const l = lengthRange.data.Data[0];

  const min = new Date(Math.min(new Date(h.min_date), new Date(l.min_date)));
  const max = new Date(Math.max(new Date(h.max_date), new Date(l.max_date)));

  return { minDate: min, maxDate: max };
}, [loading]);

// generate months for a given year
function getMonthsForYear(year) {
  if (!year || !minDate || !maxDate) return [];

  const y = Number(year);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let startMonth = 1;
  let endMonth = 12;

  if (y === minDate.getFullYear()) startMonth = minDate.getMonth() + 1;
  if (y === maxDate.getFullYear()) endMonth = maxDate.getMonth() + 1;

  return Array.from(
    { length: endMonth - startMonth + 1 },
    (_, i) => monthNames[startMonth - 1 + i]
  );
}

  return {
    loading,

    lgaList,
    allLgaList,

    years,
    allYears: [...years, "All Years"],
    getMonthsForYear,

    monthNames: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    rankingOptions,
    
    // historical datasets
    monthlyOccADRPerLGA,
    singleLGAHistOccLOS_1: hist1,
    singleLGAHistOccLOS_2: hist2,

    // length datasets
    lengthMonthlyLOSBWPerLGA: lengthMonthly,
    lengthSingleLGAAvgBWandLOS_1: len1,
    lengthSingleLGAAvgBWandLOS_2: len2,
  };
}
