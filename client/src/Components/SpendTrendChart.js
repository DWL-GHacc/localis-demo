import { useState, useEffect } from "react";
import { Chart } from "react-google-charts";

export default function SpendTrendChart({ region, year }) {
  const [chartData, setChartData] = useState([["Month", "Total Spend"]]);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!region) return;

    async function fetchMonthlySpend() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        params.append("region", region);
        if (year && year !== "all") params.append("year", year);

        const res = await fetch(
          `/api/spend_data/monthly_spend_per_region?${params.toString()}`
        );
        const json = await res.json();

        if (json.Error) {
          throw new Error(json.Message || "Error fetching monthly spend data");
        }

        const rows = json.Data || [];

        const dataRows = rows
          .sort((a, b) =>
            a.year === b.year ? a.month - b.month : a.year - b.year
          )
          .map((row) => {
            const monthLabel = `${row.year}-${String(row.month).padStart(
              2,
              "0"
            )}`;
            return [monthLabel, Number(row.total_spend || 0)];
          });

        if (dataRows.length === 0) {
          setChartData([["Month", "Total Spend"]]);
          setOptions({});
          return;
        }

        const values = dataRows.map((r) => r[1]);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal || maxVal || 1;
        const padding = range * 0.1;

        const viewMin = minVal - padding;
        const viewMax = maxVal + padding;

        setChartData([["Month", "Total Spend"], ...dataRows]);

        setOptions({
          legend: "none",
          curveType: "function",
          chartArea: { left: 40, right: 10, top: 10, bottom: 30 },
          hAxis: {
            textStyle: { fontSize: 10 },
            slantedText: true,
            slantedTextAngle: 45,
          },
          vAxis: {
            textStyle: { fontSize: 10 },
            viewWindowMode: "explicit",
            viewWindow: { min: viewMin, max: viewMax },
          },
        });
      } catch (err) {
        console.error(err);
        setError("Could not load spend trend.");
      } finally {
        setLoading(false);
      }
    }

    fetchMonthlySpend();
  }, [region, year]);

  if (error) return <p className="text-muted small mb-0">{error}</p>;
  if (loading) return <p className="text-muted small mb-0">Loading trend…</p>;
  if (chartData.length <= 1)
    return (
      <p className="text-muted small mb-0">
        Not enough data to display trend.
      </p>
    );

  return (
    <div style={{ width: "100%", height: 120 }}>
      <Chart
        chartType="LineChart"
        width="100%"
        height="100%"
        data={chartData}
        options={options}
      />
    </div>
  );
}
