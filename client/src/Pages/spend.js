import { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Card, Form, Spinner, Alert, Button } from "react-bootstrap";

import SpendFiltersBar from "../Components/SpendFiltersBar";
import SeasonalityMap from "../Components/SeasonalityMap";
import CategoryPieChart from "../Components/CategoryPieChart";
import MonthlySpendChart from "../Components/MonthlySpendChart";
import RegionCatCompChart from "../Components/RegionCatCompChart"

export default function SpendPageGoogleCharts() {

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = "admin" || "user"; // "admin" | "user" etc. --- replace with storedUser later // localStorage.

  const [regions, setRegions] = useState([]);
  const [region, setRegion] = useState("");

  const [year, setYear] = useState("2024");
  const [month, setMonth] = useState("01"); // "01".."12"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data for charts
  const [categoryRows, setCategoryRows] = useState([]);
  const [monthlyRows, setMonthlyRows] = useState([]);
  const [regionCategoryRows, setRegionCategoryRows] = useState([]);

 // Regions
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
  }, []);

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

      const paramsCategory = new URLSearchParams({ region, start, end });

      const paramsMonthly = new URLSearchParams({ region });
      const paramsRegionCategory = new URLSearchParams ({ year, month })

      const [ catRes, monthlyRes, regionCategoryRes ] = await Promise.all([
        fetch(`/api/spend_data/spend_by_category?${paramsCategory.toString()}`),
        fetch(`/api/spend_data/monthly_spend_per_region?${paramsMonthly.toString()}`),
        fetch(`/api/spend_data/spend_by_region_category?${paramsRegionCategory.toString()}`),
      ]);

      const catJson = await catRes.json();
      const monthlyJson = await monthlyRes.json();
      const regionCategoryJson = await regionCategoryRes.json();

      if (catJson.Error || monthlyJson.Error || regionCategoryJson.Error) {
        throw new Error("One or more spend endpoints returned an error");
      }

      setCategoryRows(catJson.Data || []);
      setMonthlyRows((monthlyJson.Data || []).filter((row) => row.region === region));
      setRegionCategoryRows(regionCategoryJson.Data || []);
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
  }, [region, year, month]);

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
          <SpendFiltersBar 
          regions={regions}
          region={region}
          year={year}
          month={month}
          onRegionChange={setRegion}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onRefresh={loadSpendData}
          isLoading={loading}
          />
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
          <CategoryPieChart
          categoryRows={categoryRows}
          region={region}
          year={year}
          month={month}
          />
        </Col>
        <Col md={6}>
          <MonthlySpendChart monthlyRows={monthlyRows} region={region}/>
        </Col>
      </Row>
    
      {role === "admin" && (
        <Row className="g-4">
          <Col md={6}>
            <RegionCatCompChart 
            regionCategoryRows={regionCategoryRows}
            year={year}
            month={month} />
          </Col>
          <Col md={6}>
            <SeasonalityMap isAdmin={role === "admin"} />
          </Col>
        </Row>
      )}
    </Container>
  );
}
