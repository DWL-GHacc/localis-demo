

import { Container, Row, Col, Card } from "react-bootstrap";
import { Chart } from "react-google-charts";

export default function Demo() {
  const regionName = "Sample Coastal Region";

  const monthlyData = [
    ["Month", "Spend", "Transactions"],
    ["Jan 2024", 65_000_000, 820_000],
    ["Feb 2024", 58_000_000, 770_000],
    ["Mar 2024", 72_000_000, 910_000],
    ["Apr 2024", 80_000_000, 950_000],
    ["May 2024", 76_000_000, 890_000],
    ["Jun 2024", 68_000_000, 840_000],
    ["Jul 2024", 90_000_000, 1_020_000],
    ["Aug 2024", 95_000_000, 1_050_000],
    ["Sep 2024", 88_000_000, 980_000],
    ["Oct 2024", 82_000_000, 930_000],
    ["Nov 2024", 78_000_000, 880_000],
    ["Dec 2024", 110_000_000, 1_250_000],
  ];

  const monthlyOptions = {
    title: `Monthly Spend & Transactions – ${regionName}`,
    hAxis: { title: "Month" },
    vAxes: {
      0: { title: "Spend ($)", format: "short" },
      1: { title: "Transactions" },
    },
    series: {
      0: { targetAxisIndex: 0, type: "bars" },
      1: { targetAxisIndex: 1, type: "line" },
    },
    legend: { position: "bottom" },
    chartArea: { width: "80%", height: "60%" },
  };


  const categoryData = [
    ["Category", "Spend"],
    ["Accommodation", 320_000_000],
    ["Food & Dining", 210_000_000],
    ["Retail", 140_000_000],
    ["Tours & Activities", 95_000_000],
    ["Transport", 55_000_000],
  ];

  const categoryOptions = {
    title: `Spend by Category – ${regionName}`,
    pieHole: 0.45,
    legend: { position: "right" },
    chartArea: { width: "80%", height: "80%" },
  };

  const originData = [
    ["Origin Market", "Spend"],
    ["Brisbane", 180_000_000],
    ["Sydney", 150_000_000],
    ["Melbourne", 130_000_000],
    ["Intrastate QLD", 210_000_000],
    ["International", 90_000_000],
  ];

  const originOptions = {
    title: "Top Origin Markets by Spend",
    legend: "none",
    chartArea: { left: 120, top: 40, width: "65%", height: "70%" },
    hAxis: { title: "Spend ($)", format: "short" },
    vAxis: { title: "Origin Market" },
    bars: "horizontal",
    colors: ["#047857"],
  };

  return (
    <div className="dashboard-bg">
      <Container fluid className="py-4">
        
        <Row className="mb-4">
          <Col md={7}>
            <h1 className="h3 mb-2">Destination Insight Hub Demo</h1>
            <p className="text-muted mb-0">
              Explore an example dashboard using sample data for a coastal tourism region.
              In a live hub, this would be tailored to your LGA or destination.
            </p>
          </Col>
        </Row>

        
        <Row className="g-3 mb-4">
          <Col md={3} sm={6}>
            <Card className="snapshot-stat snapshot-stat-spend">
              <Card.Body>
                <div className="snapshot-stat-label">Total Visitor Spend (2024)</div>
                <p className="snapshot-stat-value">$820m</p>
                <p className="extra-small text-muted mb-0">
                  Across all cards and transactions.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6}>
            <Card className="snapshot-stat snapshot-stat-acc">
              <Card.Body>
                <div className="snapshot-stat-label">Avg Spend per Card</div>
                <p className="snapshot-stat-value">$435</p>
                <p className="extra-small text-muted mb-0">
                  Approximate visitor spend per unique card.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6}>
            <Card className="snapshot-stat snapshot-stat-stay">
              <Card.Body>
                <div className="snapshot-stat-label">Est. Visitor Nights</div>
                <p className="snapshot-stat-value">2.4m</p>
                <p className="extra-small text-muted mb-0">
                  Based on sample occupancy and length of stay.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} sm={6}>
            <Card className="snapshot-stat">
              <Card.Body>
                <div className="snapshot-stat-label">Top Origin Market</div>
                <p className="snapshot-stat-value">Intrastate QLD</p>
                <p className="extra-small text-muted mb-0">
                  With strong spend uplift in winter and school holidays.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

 
        <Row className="g-4 mb-4">
          <Col md={7}>
            <Card className="h-100 shadow-sm border-0 dashboard-card">
              <Card.Body>
                <Card.Title className="mb-2">
                  Monthly Spend & Transactions
                </Card.Title>
                <Card.Subtitle className="text-muted small mb-3">
                  Track seasonal peaks and shoulder periods across the year.
                </Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="ComboChart"
                    width="100%"
                    height="100%"
                    data={monthlyData}
                    options={monthlyOptions}
                    loader={<div>Loading chart…</div>}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="h-100 shadow-sm border-0 dashboard-card">
              <Card.Body>
                <Card.Title className="mb-2">Spend by Category</Card.Title>
                <Card.Subtitle className="text-muted small mb-3">
                  Understand where visitors are spending across key sectors.
                </Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="PieChart"
                    width="100%"
                    height="100%"
                    data={categoryData}
                    options={categoryOptions}
                    loader={<div>Loading chart…</div>}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>


        <Row className="g-4">
          <Col md={7}>
            <Card className="h-100 shadow-sm border-0 dashboard-card">
              <Card.Body>
                <Card.Title className="mb-2">
                  Top Origin Markets by Spend
                </Card.Title>
                <Card.Subtitle className="text-muted small mb-3">
                  Identify where your most valuable visitors are coming from.
                </Card.Subtitle>
                <div style={{ height: "320px" }}>
                  <Chart
                    chartType="BarChart"
                    width="100%"
                    height="100%"
                    data={originData}
                    options={originOptions}
                    loader={<div>Loading chart…</div>}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="h-100 shadow-sm border-0 dashboard-card">
              <Card.Body>
                <Card.Title className="mb-2">How this would work for you</Card.Title>
                <Card.Subtitle className="text-muted small mb-3">
                  A live hub connects directly to your Localis datasets.
                </Card.Subtitle>
                <ul className="extra-small text-muted mb-0">
                  <li>Dashboards tailored to your LGA, region, or precinct.</li>
                  <li>Filter by time period, visitor type, and category.</li>
                  <li>Export charts and tables for reports and presentations.</li>
                  <li>Role-based access for council teams and partners.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
