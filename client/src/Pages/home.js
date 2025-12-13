import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Home({ onShowRegister, onShowLogin }) {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <>
      <section className="hero-banner d-flex align-items-center">
        <Container>
          <Row>
            <Col md={6} lg={6}>
              <div className="hero-content bg-opacity-50 p-4 rounded">
                <h1 className="display-5 fw-bold mb-3">
                  See your destination differently
                </h1>
                <p className="lead mb-4">
                  Access flight, spending and visitor movement data – tailored
                  to your region and built for smarter decisions.
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  {isLoggedIn ? (
                    <Button as={Link} to="/dashboard" variant="success">
                      Go to Dashboard
                    </Button>
                  ) : (
                    <Button variant="success" onClick={onShowLogin}>
                      Log In to your Hub
                    </Button>
                  )}

                  <Button as={Link} to="/about" variant="light">
                    Learn More
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="h3 mb-1">How it works</h2>
              <p className="text-muted mb-0">
                Secure access, clear visuals, exportable insights.
              </p>
            </Col>
          </Row>
          <Row className="g-3">
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="mb-2">1</div>
                  <Card.Title className="h5">Log in</Card.Title>
                  <Card.Text className="text-muted">
                    Access your destination's private hub with role-based
                    permissions.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="mb-2">2</div>
                  <Card.Title className="h5">Explore</Card.Title>
                  <Card.Text className="text-muted">
                    Visualise trends across flights, accommodation, spending and
                    mobility.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="mb-2">3</div>
                  <Card.Title className="h5">Act</Card.Title>
                  <Card.Text className="text-muted">
                    Export charts, share reports and inform strategy with
                    confidence.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row className="align-items-center gy-4">
            <Col md={6}>
              <div className="dih-preview rounded-4" aria-hidden="true" />
            </Col>
            <Col md={6}>
              <h2 className="h3">Your region's story, visualised</h2>
              <p className="text-muted">
                See visitor volumes, spending patterns and accommodation trends
                at a glance. Hover, filter, compare and export in seconds.
              </p>
              <Button as={Link} to="/demo" variant="success">
                View Sample Dashboard
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center">
            <Col lg={{ span: 8, offset: 2 }}>
              <h2 className="h3">Powered by Localis</h2>
              <p className="text-muted mb-4">
                Trusted by 250+ councils, RTO's and operators across Australia to
                support funding, planning and economic development.
              </p>
              <div className="mt-4">
                <img
                  src="/images/black-localis-logo.svg"
                  alt="Localis"
                  style={{ height: "50px" }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ✅ BOTTOM CTA FIXED */}
      <section className="py-5 text-center">
        <Container>
          <h2 className="h4 justify-content-center mb-3">
            Ready to explore your destination's insights?
          </h2>
          <div className="d-flex justify-content-center gap-2">
            {isLoggedIn ? (
              <Button as={Link} to="/dashboard" variant="success">
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button variant="success" onClick={onShowLogin}>
                  Log In
                </Button>
                <Button variant="warning" onClick={onShowRegister}>
                  Request Access
                </Button>
              </>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
