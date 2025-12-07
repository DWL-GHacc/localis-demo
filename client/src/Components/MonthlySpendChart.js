import { useMemo } from "react";
import { Card } from "react-bootstrap";
import { Chart } from "react-google-charts";

export default function MonthlySpendChart({ monthlyRows, region }) {
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
        return (
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
        )
    }