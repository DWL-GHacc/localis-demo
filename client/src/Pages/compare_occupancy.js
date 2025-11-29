import { Container, Form, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Chart } from "react-google-charts"
import {
  useHistoricalAllData,
  useHistoricalDataRange,
  useHistoricalAverageRates,
  useHistoricalDistinctLGAs,
  useHistoricalMonthlyOccupancyADRPerLGA,
  useHistoricalSingleLGAHistOccLOS,
} from "../API/historicalApi";
import { useState, useEffect } from "react";
import SelectField from "../Components/SelectField";


export default function CompareOccupancy() {
  const [lga, setLga] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [params, setParams] = useState({
    lga: "",
    year: null,
    month: null
  });

  const allData = useHistoricalAllData();
  const rangeData = useHistoricalDataRange();
  const averageRates = useHistoricalAverageRates();
  const distinctLGAs = useHistoricalDistinctLGAs();
  const monthlyOccADRPerLGA = useHistoricalMonthlyOccupancyADRPerLGA();
  const singleLGAHistOccLOS = useHistoricalSingleLGAHistOccLOS(lga);

  // console.log("All Data:", allData.data);
  console.log("Range Data:", rangeData.data);
  console.log("Average Rates:", averageRates.data);
  console.log("Distinct LGAs:", distinctLGAs.data);
  console.log("Monthly Occ ADR Per LGA:", monthlyOccADRPerLGA.data);
  console.log("Single LGA Hist Occ LOS:", singleLGAHistOccLOS.data);

  const lgaList = distinctLGAs.data?.Data?.map((item) => item.lga_name) || [];

  const range = rangeData.data?.Data?.[0] || {};

  const minDate = new Date(range.min_date);
  const maxDate = new Date(range.max_date);

  const minYear = minDate.getFullYear();
  const minMonth = minDate.getMonth() + 1;

  const maxYear = maxDate.getFullYear();
  const maxMonth = maxDate.getMonth() + 1;

  const years = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }

  // const chartData = [
  //   ["Year", "Sales", "Expenses"],
  //   ["2014", 1000, 400],
  //   ["2015", 1170, 460],
  //   ["2016", 660, 1120],
  //   ["2017", 1030, 540],
  // ];

  // // Material chart options
  // const chartoOptions = {
  //   chart: {
  //     title: "Company Performance",
  //     subtitle: "Sales and Expenses over the Years",
  //   },
  // };

  function getMonthsForYear(year) {
    if (!year) return [];
    year = Number(year);

    if (year === minYear && year === maxYear) {
      return Array.from(
        { length: maxMonth - minMonth + 1 },
        (_, i) => i + minMonth
      );
    }

    if (year === minYear) {
      return Array.from({ length: 12 - minMonth + 1 }, (_, i) => i + minMonth);
    }

    if (year === maxYear) {
      return Array.from({ length: maxMonth }, (_, i) => i + 1);
    }

    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

 function getSingleLGAAvgOcc(year) {
   const rows = singleLGAHistOccLOS.data?.Data || [];
   const numericYear = Number(year);

   const result = [["Month", "Average Occupancy Rate"]];

   rows.forEach((row) => {
     if (row.year === numericYear) {
       result.push([Number(row.month), Number(row.avg_occupancy)]);
     }
   });
   return result;
 };

  function getSingleLGAADR(year) {
    const rows = singleLGAHistOccLOS.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", "Average Daily Rate"]];

    rows.forEach((row) => {
      if (row.year === numericYear) {
        result.push([Number(row.month), Number(row.avg_adr)]);
      }
    });
    return result;
  };

 
 const handleSubmit = (event) => {
   event.preventDefault();

   if (!year) {
     setErrorMessage("Year is required");
     return;
   }

   setErrorMessage(""); // clear old errors

   // set parameters based on the value submitted in form
   setParams({
     lga: lga || "",
     year: Number(year),
     month: Number(month)
   });
 };

 function renderResults () {
  return (
    <div>
      <Chart
        chartType="ColumnChart"
        width="100%"
        height="100%"
        data={getSingleLGAAvgOcc(year)}
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
      <Chart
        chartType="ColumnChart"
        width="100%"
        height="100%"
        data={getSingleLGAADR(year)}
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
  );
 }

  return (
    <div>
      <Container className="px-2 py-2">
        <h2>Compare Occupancy</h2>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <SelectField
              text="Select a reigion"
              size={3}
              options={lgaList}
              value={null}
              onChange={setLga}
              placeholder="Option"
              firstOption="Region"
            />
            <SelectField
              text="Select year"
              size={3}
              options={years}
              value={null}
              onChange={setYear}
              placeholder="Option"
              firstOption="Year"
            />
            <SelectField
              text="Select month"
              size={3}
              options={getMonthsForYear(year)}
              value={null}
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
        {(params.lga && params.year) && renderResults()}
        {/* <Chart
          chartType="ColumnChart"
          width="100%"
          height="100%"
          data={getSingleLGAAvgOcc(year)}
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
        <Chart
          chartType="ColumnChart"
          width="100%"
          height="100%"
          data={getSingleLGAADR(year)}
          options={{
            title: "Average Daily Rate",
            hAxis: {
              title: "Month",
            },
            vAxis: {
              title: "AU$"
            },
          }}
        /> */}
        {/* <Chart
          // Note the usage of Bar and not BarChart for the material version
          chartType="Bar"
          data={chartData}
          options={chartoOptions}
        /> */}
      </Container>
    </div>
  );
}
