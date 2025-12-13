import { useState, useEffect } from "react";
import { Card, Form, Spinner, Alert, Row, Col } from "react-bootstrap";
import RegionMapBanner from "./RegionMapBanner";

const API_BASE_URL = "https://localis-demo.onrender.com";

export default function LGASnapshot({ isAdmin, defaultRegion }) {
  const [regions, setRegions] = useState([]); // fetch /spend_data/distinct_lgas_spend
  const [selectedRegion, setSelectedRegion] = useState(defaultRegion || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snapshotData, setSnapshotData] = useState(null);
  const [year, setYear] = useState("all");

  // ---- Load regions ----
  useEffect(() => {
    async function fetchRegions() {
      try {
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/spend_data/distinct_lgas_spend`
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `Regions request failed with status ${response.status}${
              errorText ? `: ${errorText}` : ""
            }`
          );
        }

        const json = await response.json();

        if (json.Error) {
          throw new Error(json.Message || "Error fetching regions");
        }

        const regionNames = json.Data.map((row) => row.region).filter(Boolean);
        setRegions(regionNames);

        if (!selectedRegion && regionNames.length > 0) {
          setSelectedRegion(regionNames[0]);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Could not load regions. Please try again later."
        );
      }
    }

    fetchRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ---- Load snapshot data when region/year change ----
  useEffect(() => {
    if (!selectedRegion) return;

    async function fetchSnapshot() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/snapshot?region=${encodeURIComponent(
            selectedRegion
          )}&year=${encodeURIComponent(year)}`
        );

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `Snapshot request failed with status ${response.status}${
              errorText ? `: ${errorText}` : ""
            }`
          );
        }

        const json = await response.json();

        if (json.Error) {
          throw new Error(json.Message || "Error fetching snapshot data");
        }

        setSnapshotData(json.Data || null);
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Could not load snapshot data. Please try again later."
        );
        setSnapshotData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSnapshot();
  }, [selectedRegion, year]);

  return (
    <Card className="mb-4 shadow-sm border-0 lga-snapshot-card">
      <Card.Body>
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="snapshot-dot" />
              <Card.Title className="h5 mb-1">Region Snapshot</Card.Title>
            </div>
            <Card.Subtitle className="text-muted small">
              {selectedRegion
                ? `Snapshot for ${selectedRegion} (${
                    year === "all" ? "all available years" : year
                  })`
                : isAdmin
                ? "Select any LGA to see a quick overview of visitor spend and activity."
                : "A quick overview of your destination's Lifetime data at a glance."}
            </Card.Subtitle>
          </div>

          <div className="d-flex flex-column align-items-md-end">
            <span className="text-muted small mb-1">Region selected</span>
            <Form.Select
              className="snapshot-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              aria-label="Select LGA"
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              style={{ maxWidth: "200px" }}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="all">All Years</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </Form.Select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="d-flex align-items-center gap-2 py-2">
            <Spinner animation="border" size="sm" />
            <span className="text-muted small">Loading snapshot...</span>
          </div>
        )}

        {/* Idle state */}
        {!loading && !error && !snapshotData && (
          <p className="text-muted mb-0 small">
            Select a region to view your latest snapshot.
          </p>
        )}

        {/* Map banner */}
        <RegionMapBanner region={selectedRegion} />

        {/* Snapshot content */}
        {!loading && !error && snapshotData && (
          <div className="mt-2">
            {/* Visitor spend */}
            <section className="mb-4">
              <p className="snapshot-section-title mb-4">
                Visitor spend overview
              </p>
              <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                <Row xs={1} sm={2} lg={4} className="g-3">
                  {/* KPI cards placeholder */}
                </Row>
              </div>
              <Row xs={1} sm={2} lg={4} className="g-3">
                <Col>
                  <div className="snapshot-stat">
                    <p className="snapshot-stat-label">Total spend</p>
                    <p className="snapshot-stat-value">
                      ${snapshotData.spend.totalSpend.toLocaleString()}
                    </p>
                  </div>
                </Col>

                <Col>
                  <div className="snapshot-stat">
                    <p className="snapshot-stat-label">Transactions</p>
                    <p className="snapshot-stat-value">
                      {snapshotData.spend.totalTransactions.toLocaleString()}
                    </p>
                  </div>
                </Col>

                <Col>
                  <div className="snapshot-stat">
                    <p className="snapshot-stat-label">Spend per transaction</p>
                    <p className="snapshot-stat-value">
                      $
                      {snapshotData.spend.avgSpendPerTransaction.toFixed(2)}
                    </p>
                  </div>
                </Col>

                <Col>
                  <div className="snapshot-stat">
                    <p className="snapshot-stat-label">Spend per card seen</p>
                    <p className="snapshot-stat-value">
                      ${snapshotData.spend.spendPerCard.toFixed(2)}
                    </p>
                  </div>
                </Col>
              </Row>
            </section>

            {/* Accommodation */}
            {snapshotData.occupancy && (
              <section className="mb-4">
                <p className="snapshot-section-title mb-2">
                  Accommodation performance
                </p>

                <Row xs={1} sm={2} lg={3} className="g-3">
                  <Col>
                    <div className="snapshot-stat">
                      <p className="snapshot-stat-label">Latest month</p>
                      <p className="snapshot-stat-value">
                        {new Date(
                          snapshotData.occupancy.latestDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </Col>

                  <Col>
                    <div className="snapshot-stat">
                      <p className="snapshot-stat-label">Occupancy rate</p>
                      <p className="snapshot-stat-value">
                        {(
                          snapshotData.occupancy.occupancyRate * 100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </Col>

                  <Col>
                    <div className="snapshot-stat">
                      <p className="snapshot-stat-label">
                        Average daily rate (ADR)
                      </p>
                      <p className="snapshot-stat-value">
                        ${snapshotData.occupancy.averageDailyRate.toFixed(2)}
                      </p>
                    </div>
                  </Col>
                </Row>
              </section>
            )}

            {/* Length of stay */}
            <section>
              <p className="snapshot-section-title mb-2">
                Length of stay and booking
              </p>

              <Row xs={1} sm={2} className="g-3">
                <Col>
                  <div className="snapshot-stat">
                    <p className="snapshot-stat-label">Avg length of stay</p>
                    <p className="snapshot-stat-value">
                      {snapshotData.lengthOfStay.avgLengthOfStay.toFixed(2)}{" "}
                      days
                    </p>
                  </div>
                </Col>

                <Col>
                  <div className="snapshot-stat">
                    <p className="snapshot-stat-label">Avg booking window</p>
                    <p className="snapshot-stat-value">
                      {snapshotData.lengthOfStay.avgBookingWindow.toFixed(1)}{" "}
                      days
                    </p>
                  </div>
                </Col>
              </Row>
            </section>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
