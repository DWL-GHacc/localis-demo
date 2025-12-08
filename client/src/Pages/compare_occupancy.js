import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Card,
  Tab,
  Tabs,
  Table
} from "react-bootstrap";
// import { Link } from "react-router-dom";
import { Chart } from "react-google-charts";
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
  useLengthAverageLOSBWPerLGA,
  useLengthAverageLOSBWPerLGAOverTime,
  useLengthAverageLOSPeroid,
  useLengthAverageRates,
  useLengthDataRange,
  useLengthDistinctLGAs,
  useLengthMonthlyLOSBWPerLGA,
  useLengthAvgLOSandBWByLGA,
} from "../API/lengthApi";
import { useState, useEffect } from "react";
import SelectField from "../Components/SelectField";

export default function CompareOccupancy() {
  const [lga, setLga] = useState("");
  const [lga2, setLga2] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [params, setParams] = useState({
    lga: "",
    lga2: "",
    year: null,
    month: null,
  });
  const [activeTab, setActiveTab] = useState("yearly_performance");
  const [ranking, setRanking] = useState("");

  const allData = useHistoricalAllData();
  const historicalDataRange = useHistoricalDataRange();
  const averageRates = useHistoricalAverageRates();
  const distinctLGAs = useHistoricalDistinctLGAs();
  const monthlyOccADRPerLGA = useHistoricalMonthlyOccupancyADRPerLGA();
  const singleLGAHistOccLOS_1 = useHistoricalSingleLGAHistOccLOS(params.lga);
  const singleLGAHistOccLOS_2 = useHistoricalSingleLGAHistOccLOS(params.lga2);

  const lengthAllData = useLengthAllData();
  const lengthDistinctLGAs = useLengthDistinctLGAs();
  const lengthDataRange = useLengthDataRange();
  const lengthAverageLOSBWPerLGA = useLengthAverageLOSBWPerLGA();
  const lengthAverageLOSPeroid = useLengthAverageLOSPeroid(
    "2023-01-01",
    "2023-12-31"
  ); // for testing
  const lengthAverageLOSBWPerLGAOverTime =
    useLengthAverageLOSBWPerLGAOverTime("Gold Coast"); // for testing
  const lengthAverageRates = useLengthAverageRates();
  const lengthMonthlyLOSBWPerLGA = useLengthMonthlyLOSBWPerLGA();
  const lengthSingleLGAAvgBWandLOS_1 = useLengthAvgLOSandBWByLGA(params.lga);
  const lengthSingleLGAAvgBWandLOS_2 = useLengthAvgLOSandBWByLGA(params.lga2);

  console.log("All Data:", allData.data);
  console.log("Range Data:", historicalDataRange.data);
  console.log("Average Rates:", averageRates.data);
  console.log("Distinct LGAs:", distinctLGAs.data);
  console.log("Monthly Occ ADR Per LGA:", monthlyOccADRPerLGA.data);
  console.log("Single LGA Hist Occ LOS:", singleLGAHistOccLOS_1.data);

  console.log("All Data", lengthAllData);
  console.log("Data Range", lengthDataRange);
  console.log(
    "Average Lenght of stay and Booking window for Gold coast",
    lengthAverageLOSBWPerLGAOverTime
  );
  console.log("Single LGA Average LOS and BW", lengthSingleLGAAvgBWandLOS_1);
  console.log("Average Montly LOW and BW", lengthMonthlyLOSBWPerLGA);

  const lgaList = distinctLGAs.data?.Data?.map((item) => item.lga_name) || [];
  const allLgaList = [...lgaList, "All Regions"];

  // Show loading to avoid crushing page
  if (
    historicalDataRange.loading ||
    lengthDataRange.loading ||
    !historicalDataRange.data?.Data ||
    !lengthDataRange.data?.Data
  ) {
    return <div>Loading...</div>;
  }

 // Variables to be used in functions
  const historicalRange = historicalDataRange.data?.Data?.[0] || {};
  const lengthRange = lengthDataRange.data?.Data?.[0] || {};

  // console.log("length Data range", lengthRange);

  const hMin = historicalRange.min_date
    ? new Date(historicalRange.min_date)
    : null;
  const hMax = historicalRange.max_date
    ? new Date(historicalRange.max_date)
    : null;

  const lMin = lengthRange.min_date ? new Date(lengthRange.min_date) : null;
  const lMax = lengthRange.max_date ? new Date(lengthRange.max_date) : null;

  console.log("Length Min and Max", lMin, lMax);
  const globalMinDate = [hMin, lMin]
    .filter(Boolean)
    .reduce((a, b) => (a < b ? a : b));
  const globalMaxDate = [hMax, lMax]
    .filter(Boolean)
    .reduce((a, b) => (a > b ? a : b));

  const minYear = globalMinDate.getFullYear();
  const minMonth = globalMinDate.getMonth() + 1;
  const maxYear = globalMaxDate.getFullYear();
  const maxMonth = globalMaxDate.getMonth() + 1;

  const years = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }
  const allYears = [...years, "All Years"];

  console.log("years", years);

  function getMonthsForYear(year) {
    if (!year) return [];

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

    const y = Number(year);
    let months = [];

    if (y === minYear && y === maxYear) {
      months = Array.from(
        { length: maxMonth - minMonth + 1 },
        (_, i) => i + minMonth
      );
    } else if (y === minYear) {
      months = Array.from(
        { length: 12 - minMonth + 1 },
        (_, i) => i + minMonth
      );
    } else if (y === maxYear) {
      months = Array.from({ length: maxMonth }, (_, i) => i + 1);
    } else {
      months = Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return months.map((m) => monthNames[m - 1]);
  }

  console.log(getMonthsForYear("2023"));

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

  function monthNumToName(num) {
    return monthNames[num - 1];
  };

  function monthNameToNumber(name) {
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
    return monthNames.indexOf(name) + 1; // Jan → 1, Feb → 2...
  };

  const rankingOptions = ["Occupancy Rate", "Daily Rate", "Length of Stay", "Booking Window"]


// Functions to get selected data and store them in array
  function getSingleLGAAvgOcc(year) {
    const rows = singleLGAHistOccLOS_1.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", "Average Occupancy Rate"]];

    rows.forEach((row) => {
      if (row.year === numericYear) {
        result.push([
          monthNumToName(Number(row.month)),
          Number(row.avg_occupancy),
        ]);
      }
    });
    return result;
  }

  function getAllYearsAvgOcc() {
    const rows = (singleLGAHistOccLOS_1.data?.Data || []).map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      avg_occupancy: Number(r.avg_occupancy),
    }));

    const uniqueYears = [...new Set(rows.map((r) => r.year))].sort();

    const result = [["Month", ...uniqueYears.map((y) => String(y))]];

    for (let month = 1; month <= 12; month++) {
      const row = [monthNumToName(month)];

      uniqueYears.forEach((year) => {
        const found = rows.find((r) => r.year === year && r.month === month);
        row.push(found ? found.avg_occupancy : null);
      });

      result.push(row);
    }

    return result;
  }

  console.log(getAllYearsAvgOcc());

  function getAllLGAAvgOcc(year) {
    const rows = monthlyOccADRPerLGA.data?.Data || [];
    const numericYear = Number(year);

    const filtered = rows.filter((r) => r.year === numericYear);

    const lgas = [...new Set(filtered.map((r) => r.lga_name))];

    // header for goole chart
    const result = [["Month", ...lgas]];

    for (let month = 1; month <= 12; month++) {
      const row = [month];

      lgas.forEach((lga) => {
        const found = filtered.find(
          (r) => r.lga_name === lga && r.month === month
        );
        row.push(found ? Number(found.avg_occupancy) : null);
      });

      result.push(row);
    }

    return result;
  }

  console.log("getAllLGAAvgOcc", getAllLGAAvgOcc("2023"));

  function getSingleLGAADR(year) {
    const rows = singleLGAHistOccLOS_1.data?.Data || [];
    const numbercYear = Number(year);

    const result = [["Month", "Average Daily Rate"]];

    rows.forEach((row) => {
      if (row.year === numbercYear) {
        result.push([
          monthNumToName(Number(row.month)),
          Math.round(Number(row.avg_adr) * 10) / 10,
        ]);
      }
    });
    return result;
  }

  function getAllYearsADR() {
    const rows = (singleLGAHistOccLOS_1.data?.Data || []).map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      avg_adr: Number(r.avg_adr),
    }));

    const uniqueYears = [
      ...new Set(rows.map((r) => r.year).filter((y) => !Number.isNaN(y))),
    ].sort((a, b) => a - b);

    const result = [["Month", ...uniqueYears.map((y) => `${y}`)]];

    for (let month = 1; month <= 12; month++) {
      const row = [monthNumToName(month)];

      uniqueYears.forEach((year) => {
        const found = rows.find((r) => r.year === year && r.month === month);
        row.push(found ? Math.round(found.avg_adr * 100) / 100 : null);
      });

      result.push(row);
    }

    return result;
  }

  console.log(year);
  console.log(getAllYearsADR(year));

  function getAllLGAAvgADR(year) {
    const rows = monthlyOccADRPerLGA.data?.Data || [];
    const numericYear = Number(year);

    const filtered = rows.filter((r) => r.year === numericYear);

    const lgas = [...new Set(filtered.map((r) => r.lga_name))];

    // header for goole chart
    const result = [["Month", ...lgas]];

    for (let month = 1; month <= 12; month++) {
      const row = [month];

      lgas.forEach((lga) => {
        const found = filtered.find(
          (r) => r.lga_name === lga && r.month === month
        );
        row.push(found ? Math.round(Number(found.avg_adr) * 100) / 100 : null);
      });

      result.push(row);
    }

    return result;
  }

  console.log("getAllLGAAvgADr", getAllLGAAvgADR("2023"));

  function getSingleLGAAvgLOS(year) {
    const rows = lengthSingleLGAAvgBWandLOS_1.data?.Data || [];
    const numbercYear = Number(year);

    const result = [["Month", "Avrage Length of Stay"]];

    rows.forEach((row) => {
      if (row.year === numbercYear) {
        result.push([
          monthNumToName(Number(row.month)),
          Math.round(Number(row.avg_length_of_stay) * 10) / 10,
        ]);
      }
    });
    return result;
  }
  console.log(getSingleLGAAvgLOS("2023"));

  function getAllYearsLOS() {
    const rows = (singleLGAHistOccLOS_1.data?.Data || []).map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      avg_length_of_stay: Number(r.avg_length_of_stay),
    }));

    const uniqueYears = [
      ...new Set(rows.map((r) => r.year).filter((y) => !Number.isNaN(y))),
    ].sort((a, b) => a - b);

    const result = [["Month", ...uniqueYears.map((y) => `${y}`)]];

    for (let month = 1; month <= 12; month++) {
      const row = [monthNumToName(month)];

      uniqueYears.forEach((year) => {
        const found = rows.find((r) => r.year === year && r.month === month);
        row.push(found ? Math.round(found.avg_length_of_stay * 10) / 10 : null);
      });

      result.push(row);
    }

    return result;
  }

  function getAllLGAAvgLOS(year) {
    const rows = lengthMonthlyLOSBWPerLGA.data?.Data || [];
    const numericYear = Number(year);

    const filtered = rows.filter((r) => r.year === numericYear);

    const lgas = [...new Set(filtered.map((r) => r.lga_name))];

    // header for goole chart
    const result = [["Month", ...lgas]];

    for (let month = 1; month <= 12; month++) {
      const row = [month];

      lgas.forEach((lga) => {
        const found = filtered.find(
          (r) => r.lga_name === lga && r.month === month
        );
        row.push(
          found ? Math.round(Number(found.avg_length_of_stay) * 10) / 10 : null
        );
      });

      result.push(row);
    }

    return result;
  }

  function getSingleLGAAvgBW(year) {
    const rows = lengthSingleLGAAvgBWandLOS_1.data?.Data || [];
    const numbercYear = Number(year);

    const result = [["Month", "Avrage Booking Window"]];

    rows.forEach((row) => {
      if (row.year === numbercYear) {
        result.push([
          monthNumToName(Number(row.month)),
          Math.round(Number(row.avg_booking_window) * 10) / 10,
        ]);
      }
    });
    return result;
  }

  function getAllYearsBW() {
    const rows = (singleLGAHistOccLOS_1.data?.Data || []).map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      avg_booking_window: Number(r.avg_booking_window),
    }));

    const uniqueYears = [
      ...new Set(rows.map((r) => r.year).filter((y) => !Number.isNaN(y))),
    ].sort((a, b) => a - b);

    const result = [["Month", ...uniqueYears.map((y) => `${y}`)]];

    for (let month = 1; month <= 12; month++) {
      const row = [monthNumToName(month)];

      uniqueYears.forEach((year) => {
        const found = rows.find((r) => r.year === year && r.month === month);
        row.push(found ? Math.round(found.avg_booking_window * 10) / 10 : null);
      });

      result.push(row);
    }

    return result;
  }

  console.log(getSingleLGAAvgBW("2023"));

  function getAllLGAAvgBW(year) {
    const rows = lengthMonthlyLOSBWPerLGA.data?.Data || [];
    const numericYear = Number(year);

    const filtered = rows.filter((r) => r.year === numericYear);

    const lgas = [...new Set(filtered.map((r) => r.lga_name))];

    // header for goole chart
    const result = [["Month", ...lgas]];

    for (let month = 1; month <= 12; month++) {
      const row = [month];

      lgas.forEach((lga) => {
        const found = filtered.find(
          (r) => r.lga_name === lga && r.month === month
        );
        row.push(
          found ? Math.round(Number(found.avg_booking_window) * 10) / 10 : null
        );
      });

      result.push(row);
    }

    return result;
  }

  console.log("all regions avg BW", getAllLGAAvgBW("2023"));

  function getCompareLGAsAvgOcc(year, lga, lga2) {
    const rows1 = singleLGAHistOccLOS_1.data?.Data || [];
    const rows2 = singleLGAHistOccLOS_2.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", `${lga}`, `${lga2}`]];

    for (let month = 1; month <= 12; month++) {
      const row1 = rows1.find(
        (r) => r.year === numericYear && r.month === month
      );
      const row2 = rows2.find(
        (r) => r.year === numericYear && r.month === month
      );

      result.push([
        monthNumToName(Number(month)),
        row1 ? Number(row1.avg_occupancy) : null,
        row2 ? Number(row2.avg_occupancy) : null,
      ]);
    }

    return result;
  }

  function getCompareLGAsADR(year, lga, lga2) {
    const rows1 = singleLGAHistOccLOS_1.data?.Data || [];
    const rows2 = singleLGAHistOccLOS_2.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", `${lga}`, `${lga2}`]];

    for (let month = 1; month <= 12; month++) {
      const row1 = rows1.find(
        (r) => r.year === numericYear && r.month === month
      );
      const row2 = rows2.find(
        (r) => r.year === numericYear && r.month === month
      );

      result.push([
        monthNumToName(Number(month)),
        row1 ? Math.round(Number(row1.avg_adr) * 100) / 100 : null,
        row2 ? Math.round(Number(row2.avg_adr) * 100) / 100 : null,
      ]);
    }

    return result;
  }

  function getCompareLGAsLOS(year, lga, lga2) {
    const rows1 = lengthSingleLGAAvgBWandLOS_1.data?.Data || [];
    const rows2 = lengthSingleLGAAvgBWandLOS_2.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", `${lga}`, `${lga2}`]];

    for (let month = 1; month <= 12; month++) {
      const row1 = rows1.find(
        (r) => r.year === numericYear && r.month === month
      );
      const row2 = rows2.find(
        (r) => r.year === numericYear && r.month === month
      );

      result.push([
        monthNumToName(Number(month)),
        row1 ? Math.round(Number(row1.avg_length_of_stay) * 10) / 10 : null,
        row2 ? Math.round(Number(row2.avg_length_of_stay) * 10) / 10 : null,
      ]);
    }

    return result;
  }

  function getCompareLGAsBW(year, lga, lga2) {
    const rows1 = lengthSingleLGAAvgBWandLOS_1.data?.Data || [];
    const rows2 = lengthSingleLGAAvgBWandLOS_2.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", `${lga}`, `${lga2}`]];

    for (let month = 1; month <= 12; month++) {
      const row1 = rows1.find(
        (r) => r.year === numericYear && r.month === month
      );
      const row2 = rows2.find(
        (r) => r.year === numericYear && r.month === month
      );

      result.push([
        monthNumToName(Number(month)),
        row1 ? Number(row1.avg_booking_window) : null,
        row2 ? Number(row2.avg_booking_window) : null,
      ]);
    }

    return result;
  };

  // Ranking functions
  function getMonthlyOccRanking(year, monthName) {
    const rows = monthlyOccADRPerLGA.data?.Data || [];

    const numericMonth = monthNameToNumber(monthName);

    const filtered = rows.filter(
      (r) => r.year === Number(year) && r.month === numericMonth
    );

    return filtered
      .map((r) => ({
        lga: r.lga_name,
        value: (Number(r.avg_occupancy)*100).toFixed(1) + "%",
      }))
      .sort((a, b) => b.occupancy - a.occupancy);
  };

  function getMonthlyADRRaking(year, monthName) {
    const rows = monthlyOccADRPerLGA.data?.Data || [];
    const numMonth = monthNameToNumber(monthName);

    return rows
      .filter((r) => r.year === Number(year) && r.month === numMonth)
      .map((r) => ({
        lga: r.lga_name,
        value: `$${(Math.round(r.avg_adr * 10) / 10).toFixed(1)}`,
      }))
      .sort(
        (a, b) => parseFloat(b.value.slice(1)) - parseFloat(a.value.slice(1))
      );
  };

  function getMonthlyLOSRanking(year, monthName) {
    const rows = lengthMonthlyLOSBWPerLGA.data?.Data || [];
    const numMonth = monthNameToNumber(monthName);

    return rows
      .filter((r) => r.year === Number(year) && r.month === numMonth)
      .map((r) => ({
        lga: r.lga_name,
        value:
          (Math.round(r.avg_length_of_stay * 10) / 10).toFixed(1) + " days",
      }))
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
  };

  function getMonthlyBWRanking(year, monthName) {
    const rows = lengthMonthlyLOSBWPerLGA.data?.Data || [];
    const numMonth = monthNameToNumber(monthName);

    return rows
      .filter((r) => r.year === Number(year) && r.month === numMonth)
      .map((r) => ({
        lga: r.lga_name,
        value:
          (Math.round(r.avg_booking_window * 10) / 10).toFixed(1) + " days",
      }))
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
  };
  // console.log("ranking", getMonthlyOccRanking(2023, "Aug"));

  // Submit function 
  const handleSubmit = (event) => {
    event.preventDefault();

    // Reset Params
    setParams({
      lga: "",
      lga2: "",
      year: null,
      month: null,
      ranking: ""
    });

    // Yearly Performance (only LGA + year required)
    if (activeTab === "yearly_performance") {
      if (!lga || !year) {
        setErrorMessage("Please select region and year.");
        return;
      }
    }

    // Compare Regions (LGA + LGA2 + year required)
    if (activeTab === "compare_regions") {
      if (!lga || !year) {
        setErrorMessage("Please select region and year.");
        return;
      }

      // If "All Regions" is selected, we do NOT require lga2
      if (lga !== "All Regions" && !lga2) {
        setErrorMessage("Please select two regions or choose 'All Regions'.");
        return;
      }
    }

    // Ranking (LGA + year + month)
    if (activeTab === "Ranking") {
      if (!ranking || !year || !month) {
        setErrorMessage("Please select metric, year, and month.");
        return;
      }
    }

    setErrorMessage(""); // clear old errors

    // set parameters based on the value submitted in form
    setParams({
      lga: lga || "",
      lga2: lga2 || "",
      year: year,
      month: month,
      ranking: ranking || "",
    });
  };

  function renderYearlyResults() {
    return (
      <div>
        <Row>
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-2"></Card.Title>
                <Card.Subtitle className="text-muted small mb-3"></Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsAvgOcc(params.year)
                        : getSingleLGAAvgOcc(params.year)
                    }
                    options={{
                      title: "Average Occupancy Rate",
                      hAxis: {
                        title: "Month",
                      },
                      vAxis: {
                        title: "Occupancy (%)",
                        format: "percent",
                        viewWindow: { min: 0, max: 1 },
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-2"></Card.Title>
                <Card.Subtitle className="text-muted small mb-3"></Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="LineChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsADR(params.year)
                        : getSingleLGAADR(params.year)
                    }
                    options={{
                      title: "Average Daily Rate",
                      hAxis: {
                        title: "Month",
                      },
                      vAxis: {
                        title: "AU$",
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-2"></Card.Title>
                <Card.Subtitle className="text-muted small mb-3"></Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsLOS(params.year)
                        : getSingleLGAAvgLOS(params.year)
                    }
                    options={{
                      title: "Average Length of Stay",
                      hAxis: {
                        title: "Month",
                      },
                      vAxis: {
                        title: "Days",
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-2"></Card.Title>
                <Card.Subtitle className="text-muted small mb-3"></Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsBW(params.year)
                        : getSingleLGAAvgBW(params.year)
                    }
                    options={{
                      title: "Average Booking Window",
                      hAxis: {
                        title: "Month",
                      },
                      vAxis: {
                        title: "Days",
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  function renderCompareLgaResults() {
    return (
      <div>
        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgOcc(params.year)
              : getCompareLGAsAvgOcc(params.year, params.lga, params.lga2)
          }
          options={{
            title: `Average Occupancy Rates (%)`,
            hAxis: {
              title: "Month",
            },
            vAxis: {
              title: "Occupancy (%)",
              format: "percent",
              viewWindow: { min: 0, max: 1 },
            },
          }}
        />

        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgADR(params.year)
              : getCompareLGAsADR(params.year, params.lga, params.lga2)
          }
          options={{
            title: "Average Daily Rate ($)",
            hAxis: {
              title: "Month",
            },
            vAxis: {
              title: "AU$",
            },
          }}
        />
        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgLOS(params.year)
              : getCompareLGAsLOS(params.year, params.lga, params.lga2)
          }
          options={{
            title: "Average Length of Stay",
            hAxis: {
              title: "Month",
            },
            vAxis: {
              title: "Days",
            },
          }}
        />
        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgBW(params.year)
              : getCompareLGAsBW(params.year, params.lga, params.lga2)
          }
          options={{
            title: "Average Length of Stay",
            hAxis: {
              title: "Month",
            },
            vAxis: {
              title: "Days",
            },
          }}
        />
      </div>
    );
  };

  // function renderRankingResults(){
  //   return (
  //     <div>
  //       <Table striped bordered hover>
  //         <thead>
  //           <tr>
  //             <th style={{ width: "80px" }}>Rank</th>
  //             <th>Region</th>
  //             <th style={{ width: "160px" }}> Occupancy (%)</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {getMonthlyOccRanking(params.year, params.month).map((item, index) => (
  //             <tr key={item.lga}>
  //               <td>
  //                 <strong>{index + 1}</strong>
  //               </td>
  //               <td>{item.lga}</td>
  //               <td>{item.occupancy}%</td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </Table>
  //     </div>
  //   );
  // }

  function renderRankingResults(rankingData, metricLabel) {
    return (
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th style={{ width: "80px" }}>Rank</th>
              <th>Region</th>
              <th style={{ width: "160px" }}>{metricLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((item, index) => (
              <tr key={item.lga}>
                <td>
                  <strong>{index + 1}</strong>
                </td>
                <td>{item.lga}</td>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  const handleTabChange = () => {
    // Clear state
    setLga("");
    setLga2("");
    setYear("");
    setMonth("");
    setRanking("");

    // reset Params
    setParams({
      lga: "",
      lga2: "",
      year: null,
      month: null,
      ranking: ""
    });

    setErrorMessage("");
  };
  console.log("ranking", params.ranking)

  return (
    <div>
      <Container fluid className="px-4 py-4">
        <h2>Accomodation Insights</h2>
        <Tabs
          defaultActiveKey="yearly_performance"
          id="justify-tab-example"
          className="mb-3"
          justify
          activeKey={activeTab}
          onSelect={(key) => {
            setActiveTab(key);
            handleTabChange();
          }}
        >
          <Tab eventKey="yearly_performance" title="Yearly Performance">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <SelectField
                  text="Select a reigion"
                  size={2}
                  options={lgaList}
                  value={lga}
                  onChange={setLga}
                  placeholder="Option"
                  firstOption="Region"
                />
                <SelectField
                  text="Select year"
                  size={2}
                  options={allYears}
                  value={year}
                  onChange={setYear}
                  placeholder="Option"
                  firstOption="Year"
                />
                <Col md={2} className="d-flex align-items-end">
                  <Button type="submit" className="btn btn-primary">
                    Search
                  </Button>
                </Col>
              </Row>
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}
            </Form>
            {params.lga && params.year && renderYearlyResults()}
          </Tab>
          <Tab eventKey="compare_regions" title="Compare Regions">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <SelectField
                  text="Select a reigion"
                  size={2}
                  options={allLgaList}
                  value={lga}
                  onChange={setLga}
                  placeholder="Option"
                  firstOption="Region"
                />
                <SelectField
                  text="Select a reigion"
                  size={2}
                  options={lgaList}
                  value={lga2}
                  onChange={setLga2}
                  placeholder="Option"
                  firstOption="Region"
                  disabled={lga === "All Regions"}
                />
                <SelectField
                  text="Select year"
                  size={2}
                  options={years}
                  value={year}
                  onChange={setYear}
                  placeholder="Option"
                  firstOption="Year"
                />
                <Col md={2} className="d-flex align-items-end">
                  <Button type="submit" className="btn btn-primary">
                    Search
                  </Button>
                </Col>
              </Row>
              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}
            </Form>
            {params.lga &&
              params.year &&
              (params.lga === "All Regions" || params.lga2) &&
              renderCompareLgaResults()}
          </Tab>
          <Tab eventKey="Ranking" title="Peformance Ranking">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <SelectField
                  text="Select Metric"
                  size={3}
                  options={rankingOptions}
                  value={ranking}
                  onChange={setRanking}
                  placeholder="Option"
                  firstOption="Metric"
                />
                <SelectField
                  text="Select year"
                  size={3}
                  options={years}
                  value={year}
                  onChange={setYear}
                  placeholder="Option"
                  firstOption="Year"
                />
                <SelectField
                  text="Select month"
                  size={3}
                  options={getMonthsForYear(year)}
                  value={month}
                  onChange={setMonth}
                  placeholder="Option"
                  firstOption="Month"
                />
                <Col md={3} className="d-flex align-items-end">
                  <Button type="submit" className="btn btn-primary">
                    Search
                  </Button>
                </Col>
              </Row>
            </Form>
            {/* {params.ranking === "Occupancy Rate" && params.year && params.month && renderRankingResults(getMonthlyOccRanking(params.year, params.month), params.ranking)} */}
            {params.ranking === "Occupancy Rate" &&
              renderRankingResults(
                getMonthlyOccRanking(params.year, params.month),
                "Occupancy (%)"
              )}

            {params.ranking === "Daily Rate" &&
              renderRankingResults(
                getMonthlyADRRaking(params.year, params.month),
                "Daily Rate (AU$)"
              )}

            {params.ranking === "Length of Stay" &&
              renderRankingResults(
                getMonthlyLOSRanking(params.year, params.month),
                "Length of Stay (Days)"
              )}

            {params.ranking === "Booking Window" &&
              renderRankingResults(
                getMonthlyBWRanking(params.year, params.month),
                "Booking Window (Days)"
              )}
          </Tab>
          <Tab eventKey="others" title="Ohters TBD">
            Tab content for Contact
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}