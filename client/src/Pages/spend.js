import SeasonalityMap from "../Components/SeasonalityMap";

import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { Chart } from "react-google-charts";

export default function SpendPageGoogleCharts() {
  // In future, pull this from localStorage user
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = "admin" || "user"; // "admin" | "user" etc.

  const [regions, setRegions] = useState([]);
  const [region, setRegion] = useState("");

  const [year, setYear] = useState("2024");
  const [month, setMonth] = useState("01"); // "01".."12"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data for charts
  const [categoryRows, setCategoryRows] = useState([]);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [spendByRegionRows, setSpendByRegionRows] = useState([]);

  // -------------------------------
  // Load regions for dropdown
  // -------------------------------
  useEffect(() => {
    async function loadRegions() {
      try {
        setError("");
        const res = await fetch("/api/spend_data/distinct_lgas_spend");
        const json = await res.json();
        if (json.Error) {
          throw new Error(json.Message || "Error fetching regions");
        }
        const names = (json.Data || []).map((r) => r.region);
        setRegions(names);
        if (!region && names.length > 0) {
          setRegion(names[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading regions");
      }
    }
    loadRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to build YYYY-MM-DD start/end for selected month
  function getMonthRange(y, m) {
    const yearNum = Number(y);
    const monthNum = Number(m);
    const start = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
    // last day of month: new Date(year, month, 0)
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const end = `${yearNum}-${String(monthNum).padStart(2, "0")}-${lastDay}`;
    return { start, end };
  }

  async function loadSpendData() {
    if (!region) return;

    try {
      setLoading(true);
      setError("");

      const { start, end } = getMonthRange(year, month);

      const paramsCategory = new URLSearchParams({
        region,
        start,
        end,
      });

      const paramsMonthly = new URLSearchParams({ region });

      const [
        catRes,
        monthlyRes,
        byRegionRes,
      ] = await Promise.all([
        fetch(`/api/spend_data/spend_by_category?${paramsCategory.toString()}`),
        fetch(`/api/spend_data/monthly_spend_per_region?${paramsMonthly.toString()}`),
        fetch(`/api/spend_data/spend_by_region`),
      ]);

      const catJson = await catRes.json();
      const monthlyJson = await monthlyRes.json();
      const byRegionJson = await byRegionRes.json();

      if (catJson.Error || monthlyJson.Error || byRegionJson.Error) {
        throw new Error("One or more spend endpoints returned an error");
      }

      setCategoryRows(catJson.Data || []);
      setMonthlyRows((monthlyJson.Data || []).filter((row) => row.region === region));
      setSpendByRegionRows(byRegionJson.Data || []);
    } catch (err) {
      console.error(err);
      setError("Error loading spend data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (region) {
      loadSpendData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, year, month]);

  // -------------------------------
  // 1) Pie Chart
  // -------------------------------
  const pieData = useMemo(() => {
    if (!categoryRows.length) {
      return [["Category", "Spend"]];
    }

    // Sort by spend desc
    const sorted = [...categoryRows].sort(
      (a, b) =>
        Number(b.total_spend_millions || 0) -
        Number(a.total_spend_millions || 0)
    );

    const top10 = sorted.slice(0, 10);
    const others = sorted.slice(10);

    const otherTotal = others.reduce(
      (sum, row) => sum + Number(row.total_spend_millions || 0),
      0
    );

    const data = [["Category", "Spend (millions)"]];
    top10.forEach((row) => {
      data.push([row.category, Number(row.total_spend_millions || 0)]);
    });
    if (otherTotal > 0) {
      data.push(["Other", otherTotal]);
    }
    return data;
  }, [categoryRows]);

  const pieOptions = {
    title: `Spend by Category – ${region || ""} (${year}-${month})`,
    pieHole: 0.4,
    legend: { position: "right" },
    chartArea: { width: "80%", height: "80%" },
  };

  // -------------------------------
  // 4) Monthy Spend + Transac Charts
  // -------------------------------
  const monthChartData = useMemo(() => {
    if (!monthlyRows.length) {
      return [["Month", "Spend", "Transactions"]];
    }

    const header = ["Month", "Spend", "Transactions"];
    const rows = monthlyRows.map((row) => {
      const label = `${row.year}-${String(row.month).padStart(2, "0")}`;
      return [
        label,
        Number(row.total_spend || 0),
        Number(row.total_transactions || 0),
      ];
    });

    return [header, ...rows];
  }, [monthlyRows]);

  const monthChartOptions = {
    title: `Monthly Spend & Transactions – ${region || ""}`,
    hAxis: { title: "Month" },
    vAxes: {
      0: { title: "Spend" },
      1: { title: "Transactions" },
    },
    series: {
      0: { targetAxisIndex: 0, type: "bars" },
      1: { targetAxisIndex: 1, type: "line" },
    },
    chartArea: { width: "80%", height: "70%" },
  };

  // -------------------------------
  // 2) ADMIN MAP – CATEGORY SPEND ACROSS REGIONS (STUB)
  // -------------------------------
  // For now we’ll just transform spendByRegionRows into generic data.
  const adminMapCategoryData = useMemo(() => {
    // In future, this should be category-specific (new endpoint)
    const data = [["Region", "Spend"]];
    spendByRegionRows.forEach((row) => {
      data.push([row.region, Number(row.total_spend || 0)]);
    });
    return data;
  }, [spendByRegionRows]);

  const adminMapCategoryOptions = {
    region: "AU", // Australia
    displayMode: "regions",
    resolution: "provinces",
    colorAxis: { colors: ["#e0f3f8", "#0868ac"] },
  };

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <h1 className="h3 mb-1">Spend Insights</h1>
          <p className="text-muted mb-0">
            Visualise how visitors spend across categories, time, and regions.
          </p>
        </Col>
        <Col md={6}>
          <Form className="d-flex justify-content-md-end flex-wrap gap-2 mt-3 mt-md-0">
            <Form.Group controlId="regionSelect" className="me-2">
              <Form.Label className="mb-1 small text-muted">Region</Form.Label>
              <Form.Select
                size="sm"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">Select region</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="yearSelect" className="me-2">
              <Form.Label className="mb-1 small text-muted">Year</Form.Label>
              <Form.Select
                size="sm"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="monthSelect" className="me-2">
              <Form.Label className="mb-1 small text-muted">Month</Form.Label>
              <Form.Select
                size="sm"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="01">Jan</option>
                <option value="02">Feb</option>
                <option value="03">Mar</option>
                <option value="04">Apr</option>
                <option value="05">May</option>
                <option value="06">Jun</option>
                <option value="07">Jul</option>
                <option value="08">Aug</option>
                <option value="09">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dec</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex align-items-end">
              <Button
                size="sm"
                variant="primary"
                disabled={!region}
                onClick={(e) => {
                  e.preventDefault();
                  loadSpendData();
                }}
              >
                Refresh
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" className="mb-0">
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {loading && (
        <Row className="mb-3">
          <Col className="d-flex justify-content-center">
            <Spinner animation="border" role="status" size="sm" className="me-2" />
            <span className="text-muted">Loading spend data…</span>
          </Col>
        </Row>
      )}

      
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-2">Spending by Category</Card.Title>
              <Card.Subtitle className="text-muted small mb-3">
                Top 10 categories + Other for the selected region and month.
              </Card.Subtitle>
              <div style={{ height: "320px" }}>
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="100%"
                  data={pieData}
                  options={pieOptions}
                  loader={<div>Loading chart…</div>}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="mb-2">
                Monthly Spend & Transactions
              </Card.Title>
              <Card.Subtitle className="text-muted small mb-3">
                Total spend and transaction volume over time for the selected
                region.
              </Card.Subtitle>
              <div style={{ height: "320px" }}>
                <Chart
                  chartType="ComboChart"
                  width="100%"
                  height="100%"
                  data={monthChartData}
                  options={monthChartOptions}
                  loader={<div>Loading chart…</div>}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    
      {role === "admin" && (
        <Row className="g-4">
          <Col md={6}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-2">
                  Category Spend by Region (Admin)
                </Card.Title>
                <Card.Subtitle className="text-muted small mb-3">
                  Darker regions indicate higher spend. (Category filter to be
                  added.)
                </Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="GeoChart"
                    width="100%"
                    height="100%"
                    data={adminMapCategoryData}
                    options={adminMapCategoryOptions}
                    loader={<div>Loading map…</div>}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <SeasonalityMap isAdmin={role === "admin"} />
          </Col>
        </Row>
      )}
    </Container>
  );
}
