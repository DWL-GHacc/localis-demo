import { useState, useEffect } from "react";
import {
  useHistoricalAllData,
  useHistoricalDataRange,
  useHistoricalAverageRates,
  useHistoricalDistinctLGAs,
  useHistoricalMonthlyOccupancyADRPerLGA,
  useHistoricalSingleLGAHistOccLOS,
} from "../API/historicalApi";
import {
    useLengthAllData,
    useLengthDistinctLGAs,
    useLengthDataRange,
    useLengthAverageLOSBWPerLGA,
    useLengthAverageLOSPeroid,
    useLengthAverageLOSBWPerLGAOverTime,
    useLengthAverageRates,
    useLengthMonthlyLOSBWPerLGA
} from "../API/lengthApi";


export default function ApiTest() {
  const historicalAllData = useHistoricalAllData();
  const historicalRangeData = useHistoricalDataRange();
  const historicalAverageRates = useHistoricalAverageRates();
  const historicalDistinctLGAs = useHistoricalDistinctLGAs();
  const historicalMonthlyOccADRPerLGA = useHistoricalMonthlyOccupancyADRPerLGA();
  const historicalSingleLGAHistOccLOS = useHistoricalSingleLGAHistOccLOS("Cairns"); // for testing
  const lengthAllData = useLengthAllData();
  const lengthDistinctLGAs = useLengthDistinctLGAs();
  const lengthDataRange = useLengthDataRange();
  const lengthAverageLOSBWPerLGA = useLengthAverageLOSBWPerLGA();
  const lengthAverageLOSPeroid = useLengthAverageLOSPeroid("2023-01-01", "2023-12-31"); // for testing
  const lengthAverageLOSBWPerLGAOverTime = useLengthAverageLOSBWPerLGAOverTime("Gold Coast"); // for testing
  const lengthAverageRates = useLengthAverageRates();
  const lengthMonthlyLOSBWPerLGA = useLengthMonthlyLOSBWPerLGA();

  return (
    <div>
      <h2>API test</h2>

      {/* <p>Loading: {.loading ? "true" : "false"}</p>
      <p>Data:{" "}{.data ? JSON.stringify(.data) : "No data"}</p>
      <p>Error: {.error ? .error.message : "No error"}</p> */}

      {/* <p>Loading: {historicalAllData.loading ? "true" : "false"}</p>
      <p>Data: {historicalAllData.data ? JSON.stringify(historicalAllData.data) : "No data"}</p>
      <p>Error: {historicalAllData.error ? historicalAllData.error.message : "No error"}</p> */}

      {/* <p>Loading: {historicalRangeData.loading ? "true" : "false"}</p>
      <p>Data: {historicalRangeData.data ? JSON.stringify(historicalRangeData.data) : "No data"}</p>
      <p>Error: {historicalRangeData.error ? historicalRangeData.error.message : "No error"}</p> */}

      {/* <p>Loading: {historicalAverageRates.loading ? "true" : "false"}</p>
      <p>Data: {historicalAverageRates.data ? JSON.stringify(historicalAverageRates.data) : "No data"}</p>
      <p>Error: {historicalAverageRates.error ? historicalAverageRates.error.message : "No error"}</p> */}

      {/* <p>Loading: {historicalDistinctLGAs.loading ? "true" : "false"}</p>
      <p>Data: {historicalDistinctLGAs.data ? JSON.stringify(historicalDistinctLGAs.data) : "No data"}</p>
      <p>Error: {historicalDistinctLGAs.error ? historicalDistinctLGAs.error.message : "No error"}</p> */}

      {/* <p>Loading: {historicalMonthlyOccADRPerLGA.loading ? "true" : "false"}</p>
      <p>Data: {historicalMonthlyOccADRPerLGA.data ? JSON.stringify(historicalMonthlyOccADRPerLGA.data) : "No data"}</p>
      <p>Error: {historicalMonthlyOccADRPerLGA.error ? historicalMonthlyOccADRPerLGA.error.message : "No error"}</p> */}

      {/* <p>Loading: {historicalSingleLGAHistOccLOS.loading ? "true" : "false"}</p>
      <p>Data: {historicalSingleLGAHistOccLOS.data ? JSON.stringify(historicalSingleLGAHistOccLOS.data) : "No data"}</p>
      <p>Error: {historicalSingleLGAHistOccLOS.error ? historicalSingleLGAHistOccLOS.error.message : "No error"}</p> */}

      {/* <p>Loading: {lengthAllData.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthAllData.data ? JSON.stringify(lengthAllData.data) : "No data"}</p>
      <p>Error: {lengthAllData.error ? lengthAllData.error.message : "No error"}</p> */}

      {/* <p>Loading: {lengthDistinctLGAs.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthDistinctLGAs.data ? JSON.stringify(lengthDistinctLGAs.data) : "No data"}</p>
      <p>Error: {lengthDistinctLGAs.error ? lengthDistinctLGAs.error.message : "No error"}</p> */}

      {/* <p>Loading: {lengthDataRange.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthDataRange.data ? JSON.stringify(lengthDataRange.data) : "No data"}</p>
      <p>Error: {lengthDataRange.error ?lengthDataRange.error.message : "No error"}</p> */}

      {/* <p>Loading: {lengthAverageLOSBWPerLGA.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthAverageLOSBWPerLGA.data ? JSON.stringify(lengthAverageLOSBWPerLGA.data) : "No data"}</p>
      <p>Error: {lengthAverageLOSBWPerLGA.error ? lengthAverageLOSBWPerLGA.error.message : "No error"}</p> */}

      {/* <p>Loading: {lengthAverageLOSPeroid.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthAverageLOSPeroid.data? JSON.stringify(lengthAverageLOSPeroid.data) : "No data"}</p>
      <p>Error:{" "}{lengthAverageLOSPeroid.error ? lengthAverageLOSPeroid.error.messag  : "No error"}</p> */}

      {/* <p>Loading: {lengthAverageLOSBWPerLGAOverTime.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthAverageLOSBWPerLGAOverTime.data ? JSON.stringify(lengthAverageLOSBWPerLGAOverTime.data) : "No data"}</p>
      <p>Error: {lengthAverageLOSBWPerLGAOverTime.error ? lengthAverageLOSBWPerLGAOverTime.error.message : "No error"}</p> */}

      {/* <p>Loading: {lengthAverageRates.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthAverageRates.data ? JSON.stringify(lengthAverageRates.data) : "No data"}</p>
      <p>Error: {lengthAverageRates.error ? lengthAverageRates.error.message : "No error"}</p> */}

      <p>Loading: {lengthMonthlyLOSBWPerLGA.loading ? "true" : "false"}</p>
      <p>Data:{" "}{lengthMonthlyLOSBWPerLGA.data ? JSON.stringify(lengthMonthlyLOSBWPerLGA.data) : "No data"}</p>
      <p>Error: {lengthMonthlyLOSBWPerLGA.error ? lengthMonthlyLOSBWPerLGA.error.message : "No error"}</p>
    </div>
  );
}
