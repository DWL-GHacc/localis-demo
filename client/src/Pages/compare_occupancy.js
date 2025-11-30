import {
  Container,
  Form,
  Row,
  Col,
  Button,
  Card,
  Tab,
  Tabs,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { Chart } from "react-google-charts";
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

  const allData = useHistoricalAllData();
  const rangeData = useHistoricalDataRange();
  const averageRates = useHistoricalAverageRates();
  const distinctLGAs = useHistoricalDistinctLGAs();
  const monthlyOccADRPerLGA = useHistoricalMonthlyOccupancyADRPerLGA();
  const singleLGAHistOccLOS_1 = useHistoricalSingleLGAHistOccLOS(params.lga);
  const singleLGAHistOccLOS_2 = useHistoricalSingleLGAHistOccLOS(params.lga2);

  // console.log("All Data:", allData.data);
  console.log("Range Data:", rangeData.data);
  console.log("Average Rates:", averageRates.data);
  console.log("Distinct LGAs:", distinctLGAs.data);
  console.log("Monthly Occ ADR Per LGA:", monthlyOccADRPerLGA.data);
  console.log("Single LGA Hist Occ LOS:", singleLGAHistOccLOS_1.data);

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
  }

  function getSingleLGAAvgOcc(year) {
    const rows = singleLGAHistOccLOS_1.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", "Average Occupancy Rate"]];

    rows.forEach((row) => {
      if (row.year === numericYear) {
        result.push([Number(row.month), Number(row.avg_occupancy)]);
      }
    });
    return result;
  }

  function getSingleLGAADR(year) {
    const rows = singleLGAHistOccLOS_1.data?.Data || [];
    const numericYear = Number(year);

    const result = [["Month", "Average Daily Rate"]];

    rows.forEach((row) => {
      if (row.year === numericYear) {
        result.push([Number(row.month), Number(row.avg_adr)]);
      }
    });
    return result;
  }

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
        month,
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
        month,
        row1 ? Number(row1.avg_adr) : null,
        row2 ? Number(row2.avg_adr) : null,
      ]);
    }

    return result;
  }

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
      lga2: lga2 || "",
      year: Number(year),
      month: Number(month),
    });
  };

  function renderYearlyResults() {
    return (
      <div>
        <Chart
          chartType="ColumnChart"
          width="100%"
          height="100%"
          data={getSingleLGAAvgOcc(params.year)}
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
          data={getSingleLGAADR(params.year)}
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

  function renderCompareLgaResults() {
    return (
      <div>
        <Chart
          chartType="ColumnChart"
          data={getCompareLGAsAvgOcc(params.year, params.lga, params.lga2)}
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
          data={getCompareLGAsADR(params.year, params.lga, params.lga2)}
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
      </div>
    );
  };

  const handleTabChange = () => {
    // Clear state
    setLga("");
    setLga2("");
    setYear("");
    setMonth("");

    // reset Params
    setParams({
      lga: "",
      lga2: "",
      year: null,
      month: null,
    });

    setErrorMessage("");
  };

  return (
    <div>
      <Container className="px-2 py-2">
        <h2>Compare Occupancy</h2>
        <Tabs
          defaultActiveKey="yearly_performance"
          id="justify-tab-example"
          className="mb-3"
          justify
          onSelect={handleTabChange}
        >
          <Tab eventKey="yearly_performance" title="Yearly Performance">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <SelectField
                  text="Select a reigion"
                  size={3}
                  options={lgaList}
                  value={lga}
                  onChange={setLga}
                  placeholder="Option"
                  firstOption="Region"
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
                <Col md={3} className="d-flex align-items-end">
                  <Button type="submit" className="btn btn-primary">
                    Search
                  </Button>
                </Col>
              </Row>
            </Form>
            {params.lga && params.year && renderYearlyResults()}
          </Tab>
          <Tab eventKey="compare_regions" title="Compare Regions">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <SelectField
                  text="Select a reigion"
                  size={3}
                  options={lgaList}
                  value={lga}
                  onChange={setLga}
                  placeholder="Option"
                  firstOption="Region"
                />
                <SelectField
                  text="Select a reigion"
                  size={3}
                  options={lgaList}
                  value={lga2}
                  onChange={setLga2}
                  placeholder="Option"
                  firstOption="Region"
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
                {/* <SelectField
                  text="Select month"
                  size={2}
                  options={getMonthsForYear(year)}
                  value={null}
                  onChange={setMonth}
                  placeholder="Option"
                  firstOption="Month"
                /> */}
                <Col md={3} className="d-flex align-items-end">
                  <Button type="submit" className="btn btn-primary">
                    Search
                  </Button>
                </Col>
              </Row>
            </Form>
            {params.lga &&
              params.lga2 &&
              params.year &&
              renderCompareLgaResults()}
          </Tab>
          <Tab eventKey="Ranking" title="Ranking">
            Tab content for Loooonger Tab
          </Tab>
          <Tab eventKey="others" title="Ohters TBD">
            Tab content for Contact
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}
