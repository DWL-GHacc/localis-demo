import { Form, Button } from "react-bootstrap";

export default function spendFiltersBar({ 
    regions, 
    region, 
    year, 
    month, 
    onRegionChange,
    onYearChange,
    onMonthChange,
    onRefresh,
    isLoading
}) {
    return(
        <Form className="d-flex justify-content-md-end flex-wrap gap-2 mt-3 mt-md-0">
            <Form.Group controlId="regionSelect" className="me-2">
              <Form.Label className="mb-1 small text-muted">Region</Form.Label>
              <Form.Select
                size="sm"
                value={region}
                onChange={(e) => onRegionChange(e.target.value)}
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
                onChange={(e) => onYearChange(e.target.value)}
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
                onChange={(e) => onMonthChange(e.target.value)}
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
                  onRefresh();
                }}
              >
                { isLoading ? "Refreshing..." : "Refresh" }
              </Button>
            </div>
          </Form>
    );
}