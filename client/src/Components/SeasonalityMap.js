import { useEffect, useState, useMemo } from "react";
import { Card, Form, Spinner, Alert } from "react-bootstrap";
import { Chart } from "react-google-charts";

const API_BASE_URL = "https://localis-demo.onrender.com";

export default function SeasonalityMap({ isAdmin }) {
  const [rows, setRows] = useState([]); // raw data from /spend_intensity
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    async function loadIntensity() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE_URL}/api/spend_data/spend_intensity`
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Spend intensity request failed with status ${res.status}${
              text ? `: ${text}` : ""
            }`
          );
        }

        const json = await res.json();

        if (json.Error) {
          throw new Error(
            json.Message || "Error loading spend intensity data"
          );
        }

        const data = json.Data || [];
        console.log("SeasonalityMap /spend_intensity data:", data);
        setRows(data);

        if (data.length > 0) {
          const years = Array.from(
            new Set(data.map((r) => Number(r.year)))
          ).sort((a, b) => a - b);

          const defaultYear = years[years.length - 1];
          setSelectedYear(String(defaultYear));

          const monthsForYear = data
            .filter((r) => Number(r.year) === defaultYear)
            .map((r) => Number(r.month));
          const uniqueMonths = Array.from(new Set(monthsForYear)).sort(
            (a, b) => a - b
          );
          const defaultMonth = uniqueMonths[0] || 1;
          setSelectedMonth(String(defaultMonth).padStart(2, "0"));
        }
      } catch (err) {
        console.error("SeasonalityMap error:", err);
        setError(err.message || "Error loading seasonality data");
      } finally {
        setLoading(false);
      }
    }

    loadIntensity();
  }, []);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(rows.map((r) => Number(r.year)))).sort(
      (a, b) => a - b
    );
    return years;
  }, [rows]);

  const monthOptions = useMemo(() => {
    if (!selectedYear) return [];

    const months = rows
      .filter((r) => String(r.year) === String(selectedYear))
      .map((r) => Number(r.month));
    const uniqueMonths = Array.from(new Set(months)).sort((a, b) => a - b);
    return uniqueMonths;
  }, [rows, selectedYear]);

  const filteredRows = useMemo(() => {
    if (!selectedYear || !selectedMonth) return [];

    return rows.filter(
      (r) =>
        String(r.year) === String(selectedYear) &&
        String(r.month).padStart(2, "0") === String(selectedMonth)
    );
  }, [rows, selectedYear, selectedMonth]);

  const regionTotals = useMemo(() => {
    const totals = new Map();

    filteredRows.forEach((r) => {
      const region = r.region;
      const spend = Number(r.total_spend || 0);

      if (!totals.has(region)) {
        totals.set(region, spend);
      } else {
        totals.set(region, totals.get(region) + spend);
      }
    });

    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredRows]);

  const chartData = useMemo(() => {
    const data = [["Region", "Total spend"]];

    regionTotals.forEach(([region, spend]) => {
      data.push([region, spend]);
    });

    return data;
  }, [regionTotals]);

  const chartOptions = {
    title: `Total spend by region - ${selectedMonth || "--"}/${selectedYear || "--"}`,
    legend: "none",
    colors: ["#3c8d40"],
    hAxis: {
      title: "Region",
      textStyle: { fontSize: 10 },
      slantedText: true,
      slantedTextAngle: 30,
    },
    vAxis: {
      title: "Total spend",
    },
    chartArea: { left: 60, top: 50, width: "75%", height: "60%" },
    bar: { groupWidth: "60%" },
  };

  if (!isAdmin) return null;

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-baseline mb-2">
          <div>
            <Card.Title className="mb-0">
              Seasonality by Region (Admin)
            </Card.Title>
            <Card.Subtitle className="text-muted small">
              Bars show total spend for the selected month and year by region.
            </Card.Subtitle>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mt-2">
            {error}
          </Alert>
        )}

        {loading && (
          <div className="d-flex align-items-center mt-3">
            <Spinner
              animation="border"
              role="status"
              size="sm"
              className="me-2"
            />
            <span className="text-muted small">
              Loading seasonality data…
            </span>
          </div>
        )}

        {/* Filters */}
        <Form className="d-flex flex-wrap gap-2 mt-3 mb-3">
          <Form.Group controlId="seasonYear" className="me-2">
            <Form.Label className="mb-1 small text-muted">Year</Form.Label>
            <Form.Select
              size="sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="seasonMonth" className="me-2">
            <Form.Label className="mb-1 small text-muted">Month</Form.Label>
            <Form.Select
              size="sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {monthOptions.map((m) => (
                <option key={m} value={String(m).padStart(2, "0")}>
                  {new Date(2000, m - 1, 1).toLocaleString("en-AU", {
                    month: "short",
                  })}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>

        {/* Chart */}
        {regionTotals.length > 0 ? (
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="320px"
            data={chartData}
            options={chartOptions}
            loader={<div>Loading chart…</div>}
          />
        ) : (
          !loading && (
            <div className="text-muted small mt-3">
              No data available for {selectedMonth}/{selectedYear}.
            </div>
          )
        )}

        {/* Legend */}
        {regionTotals.length > 0 && (
          <div className="mt-2 small text-muted">
            <strong>Current view:</strong> {selectedMonth}/{selectedYear}
            <ul className="mb-0">
              {regionTotals.map(([region, spend]) => (
                <li key={region}>
                  {region}: ${spend.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
