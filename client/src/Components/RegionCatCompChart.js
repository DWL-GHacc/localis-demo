import { useMemo, useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import { Chart } from "react-google-charts";

export default function RegionCategoryComparisonChart({
  regionCategoryRows,
  year,
  month,
}) {

  const periodRows = useMemo(() => {
    if (!regionCategoryRows || !regionCategoryRows.length) return [];

    return regionCategoryRows.filter((row) => {
      const rowYear = String(row.year);
      const rowMonth = String(row.month).padStart(2, "0");
      return rowYear === String(year) && rowMonth === String(month);
    });
  }, [regionCategoryRows, year, month]);

  const topCategories = useMemo(() => {
    if (!periodRows.length) return [];

    const totalsByCategory = new Map();

    periodRows.forEach((row) => {
      const cat = row.category || "Uncategorised";
      const spend = Number(row.total_spend || 0);

      if (!totalsByCategory.has(cat)) {
        totalsByCategory.set(cat, spend);
      } else {
        totalsByCategory.set(cat, totalsByCategory.get(cat) + spend);
      }
    });

    return Array.from(totalsByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cat]) => cat);
  }, [periodRows]);



  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!topCategories.length) {
      setSelectedCategory("");
      return;
    }

    if (!selectedCategory || !topCategories.includes(selectedCategory)) {
      setSelectedCategory(topCategories[0]);
    }
  }, [topCategories, selectedCategory]);

    const regionTotals = useMemo(() => {
      if (!periodRows.length || !selectedCategory) return [];

      const filtered = periodRows.filter(
        (row) => (row.category || "Uncategorised") === selectedCategory
      );

      if (!filtered.length) return [];

      const totalsByRegion = new Map();

      filtered.forEach((row) => {
        const region = row.region;
        const spend = Number(row.total_spend || 0);

        if (!totalsByRegion.has(region)) {
          totalsByRegion.set(region, spend);
        } else {
          totalsByRegion.set(region, totalsByRegion.get(region) + spend);
        }
      });

      // Sorted array of [region, spend]
      return Array.from(totalsByRegion.entries()).sort((a, b) => b[1] - a[1]);
    }, [periodRows, selectedCategory]);

    const chartData = useMemo(() => {
      if (!regionTotals.length) return [["Region", "Spend"]];

      const data = [["Region", "Spend"]];
      regionTotals.forEach(([region, spend]) => {
        data.push([region, spend]);
      });
      return data;
    }, [regionTotals]);

    const hasData = chartData.length > 1;

    const displayMonth = new Date(
      Number(year),
      Number(month) - 1,
      1
    ).toLocaleString("en-AU", { month: "short", year: "numeric" });

    const options = {
      title: `Spend by Region – ${
        selectedCategory || "No category"
      } (${displayMonth})`,
      legend: "none",
      chartArea: { left: 60, top: 50, width: "75%", height: "65%" },
      hAxis: {
        title: "Region",
        textStyle: { fontSize: 10 },
        slantedText: true,
        slantedTextAngle: 30,
      },
      vAxis: {
        title: "Spend",
      },
      colors: ["#0868ac"],
      bar: { groupWidth: "60%" },
    };

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <div className="mb-2">
            <Card.Title className="mb-1">
              Region Spend by Category (Admin)
            </Card.Title>
            <Card.Subtitle className="text-muted small">
              Compare spend across regions for one of the top 10 categories.
            </Card.Subtitle>

          {topCategories.length > 0 && (
            <Form className="d-flex flex-wrap gap-2 mt-2 mb-3">
            <Form.Group controlId="regionCategorySelect" className="ms-3">
              <Form.Label className="mb-1 small text-muted">
                Category
              </Form.Label>
              <Form.Select
                size="sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {topCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            </Form>
          )}
        </div>

        <div style={{ height: "320px" }}>
          {hasData ? (
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="100%"
              data={chartData}
              options={options}
              loader={<div>Loading chart…</div>}
            />
          ) : (
            <div className="text-muted small d-flex h-100 align-items-center">
              No data available for {displayMonth} and the selected category.
            </div>
          )}
        </div>
        {/* Legend */}
        {regionTotals.length > 0 && (
          <div className="mt-2 small text-muted">
            <strong>Current view:</strong> {selectedCategory} – {displayMonth}
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
