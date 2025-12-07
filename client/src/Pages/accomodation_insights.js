import { useState } from "react";
import {
  Container,
  Tabs,
  Tab,
  Row,
  Col,
  Button,
  Form,
  Table,
  Card,
} from "react-bootstrap";
import { Chart } from "react-google-charts";

import SelectField from "../Components/SelectField";

// Hooks
import useSharedData from "../Hooks/accomodation_hook";

// Helpers
import {
  getSingleLGAAvgOcc,
  getAllYearsAvgOcc,
  getSingleLGAADR,
  getAllYearsADR,
  getSingleLGAAvgLOS,
  getAllYearsLOS,
  getSingleLGAAvgBW,
  getAllYearsBW,
  getAllLGAAvgOcc,
  getAllLGAAvgADR,
  getAllLGAAvgLOS,
  getAllLGAAvgBW,
  getCompareLGAsAvgOcc,
  getCompareLGAsADR,
  getCompareLGAsLOS,
  getCompareLGAsBW,
} from "../utils/chartHelpers";

import {
  getMonthlyOccRanking,
  getMonthlyADRRaking,
  getMonthlyLOSRanking,
  getMonthlyBWRanking,
} from "../utils/rankingHelpers";

import { monthNames, monthNameToNumber } from "../utils/dateHelpers";

export default function AccomodationInsights() {
  // UI States
  const [lga, setLga] = useState("");
  const [lga2, setLga2] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [ranking, setRanking] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [params, setParams] = useState({
    lga: "",
    lga2: "",
    year: null,
    month: null,
    ranking: "",
  });

  const [activeTab, setActiveTab] = useState("yearly_performance");

  // Shared dataset (from all APIs)
  const shared = useSharedData(params.lga, params.lga2);

  // loading
  if (shared.loading) return <div>Loading...</div>;

  const {
    lgaList,
    allLgaList,
    years,
    allYears,
    rankingOptions,
    getMonthsForYear,

    monthlyOccADRPerLGA,
    singleLGAHistOccLOS_1,
    singleLGAHistOccLOS_2,
    lengthMonthlyLOSBWPerLGA,
    lengthSingleLGAAvgBWandLOS_1,
    lengthSingleLGAAvgBWandLOS_2,
  } = shared;

  console.log(
    lgaList,
    allLgaList,
    years,
    allYears,
    rankingOptions,
    getMonthsForYear,

    monthlyOccADRPerLGA,
    singleLGAHistOccLOS_1,
    lengthMonthlyLOSBWPerLGA,
    lengthSingleLGAAvgBWandLOS_1
  );

  // Submit function
  const handleSubmit = (event) => {
    event.preventDefault();

    // Reset Params
    setParams({
      lga: "",
      lga2: "",
      year: null,
      month: null,
      ranking: "",
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
      year: year || "",
      month: month,
      ranking: ranking || "",
    });
  };

  function renderYearlyResults() {
    const occRows = singleLGAHistOccLOS_1.data?.Data || [];
    const losBwRows = lengthSingleLGAAvgBWandLOS_1.data?.Data || [];

    return (
      <div>
        <Row>
          {/* OCCUPANCY */}
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsAvgOcc(occRows)
                        : getSingleLGAAvgOcc(occRows, params.year)
                    }
                    options={{
                      title: "Average Occupancy Rate",
                      hAxis: { title: "Month" },
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

          {/* ADR */}
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="LineChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsADR(occRows)
                        : getSingleLGAADR(occRows, params.year)
                    }
                    options={{
                      title: "Average Daily Rate (AU$)",
                      hAxis: { title: "Month" },
                      vAxis: { title: "AU$" },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* LOS + BW */}
        <Row className="mt-4">
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsLOS(losBwRows)
                        : getSingleLGAAvgLOS(losBwRows, params.year)
                    }
                    options={{
                      title: "Average Length of Stay",
                      hAxis: { title: "Month" },
                      vAxis: { title: "Days" },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="100%"
                    data={
                      params.year === "All Years"
                        ? getAllYearsBW(losBwRows)
                        : getSingleLGAAvgBW(losBwRows, params.year)
                    }
                    options={{
                      title: "Average Booking Window",
                      hAxis: { title: "Month" },
                      vAxis: { title: "Days" },
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
    const monthlyRows = monthlyOccADRPerLGA.data?.Data || [];
    const losBwRows = lengthMonthlyLOSBWPerLGA.data?.Data || [];
    const single1Occ = singleLGAHistOccLOS_1.data?.Data || [];
    const single2Occ = singleLGAHistOccLOS_2.data?.Data || [];
    const single1Len = lengthSingleLGAAvgBWandLOS_1.data?.Data || [];
    const single2Len = lengthSingleLGAAvgBWandLOS_2.data?.Data || [];

    return (
      <div>
        {/* OCCUPANCY */}
        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgOcc(monthlyRows, params.year)
              : getCompareLGAsAvgOcc(
                  single1Occ,
                  single2Occ,
                  params.year,
                  params.lga,
                  params.lga2
                )
          }
          options={{
            title: `Average Occupancy Rates (%)`,
            hAxis: { title: "Month" },
            vAxis: {
              title: "Occupancy (%)",
              format: "percent",
              viewWindow: { min: 0, max: 1 },
            },
          }}
        />

        {/* ADR */}
        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgADR(monthlyRows, params.year)
              : getCompareLGAsADR(
                  single1Occ,
                  single2Occ,
                  params.year,
                  params.lga,
                  params.lga2
                )
          }
          options={{
            title: "Average Daily Rate ($)",
            hAxis: { title: "Month" },
            vAxis: { title: "AU$" },
          }}
        />

        {/* LOS */}
        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgLOS(losBwRows, params.year)
              : getCompareLGAsLOS(
                  single1Len,
                  single2Len,
                  params.year,
                  params.lga,
                  params.lga2
                )
          }
          options={{
            title: "Average Length of Stay",
            hAxis: { title: "Month" },
            vAxis: { title: "Days" },
          }}
        />

        {/* BOOKING WINDOW */}
        <Chart
          chartType="ColumnChart"
          data={
            params.lga === "All Regions"
              ? getAllLGAAvgBW(losBwRows, params.year)
              : getCompareLGAsBW(
                  single1Len,
                  single2Len,
                  params.year,
                  params.lga,
                  params.lga2
                )
          }
          options={{
            title: "Average Booking Window",
            hAxis: { title: "Month" },
            vAxis: { title: "Days" },
          }}
        />
      </div>
    );
  }

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
      ranking: "",
    });

    setErrorMessage("");
  };
  console.log("ranking", params.ranking);

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
            {params.ranking === "Occupancy Rate" &&
              renderRankingResults(
                getMonthlyOccRanking(
                  monthlyOccADRPerLGA.data?.Data,
                  params.year,
                  params.month
                ),
                "Occupancy (%)"
              )}

            {params.ranking === "Daily Rate" &&
              renderRankingResults(
                getMonthlyADRRaking(
                  monthlyOccADRPerLGA.data?.Data,
                  params.year,
                  params.month
                ),
                "Daily Rate (AU$)"
              )}

            {params.ranking === "Length of Stay" &&
              renderRankingResults(
                getMonthlyLOSRanking(
                  lengthMonthlyLOSBWPerLGA.data?.Data,
                  params.year,
                  params.month
                ),
                "Length of Stay (Days)"
              )}

            {params.ranking === "Booking Window" &&
              renderRankingResults(
                getMonthlyBWRanking(
                  lengthMonthlyLOSBWPerLGA.data?.Data,
                  params.year,
                  params.month
                ),
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
