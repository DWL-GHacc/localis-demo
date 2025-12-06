import { Chart } from "react-google-charts";
import { Card, Button } from "react-bootstrap";
import { useMemo, useState } from "react";

// Export functionality
function exportCsv(filename, rows) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export default function CategoryPieChart({ categoryRows, region, year, month }) {
  const [chartWrapper, setChartWrapper] = useState(null);

  const pieData = useMemo(() => {
    if (!categoryRows.length) {
      return [["Category", "Spend(millions)"]];
    }

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

  const chartEvents = [
    {
      eventName: "ready",
      callback: ({ chartWrapper }) => {
        setChartWrapper(chartWrapper);
      },
    },
  ];

  const handleExportCsv = () => {
    exportCsv(
      `category-spend-${region || "all"}-${year}-${month}.csv`,
      categoryRows
    );
  };

  const handleExportPng = () => {
    if (!chartWrapper) return;

    const chart = chartWrapper.getChart();
    const imgUri = chart.getImageURI(); 

    const link = document.createElement("a");
    link.href = imgUri;
    link.download = `category-spend-${region || "all"}-${year}-${month}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <Card.Title className="mb-1">Spending by Category</Card.Title>
            <Card.Subtitle className="text-muted small mb-0">
              Top 10 categories + Other for the selected region and month.
            </Card.Subtitle>
          </div>

          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleExportCsv}
              disabled={!categoryRows || categoryRows.length === 0}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleExportPng}
              disabled={!chartWrapper}
            >
              Export PNG
            </Button>
          </div>
        </div>

        <div style={{ height: "320px" }}>
          <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={pieData}
            options={pieOptions}
            loader={<div>Loading chart…</div>}
            chartEvents={chartEvents}
          />
        </div>
      </Card.Body>
    </Card>
  );
}
