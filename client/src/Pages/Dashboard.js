import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faBed, faPlane } from "@fortawesome/free-solid-svg-icons";
import LGASnapshot from "../Components/LGASnapshot";

export default function Dashboard() {
  const userName = localStorage.getItem("userName") || "there";
  const isAdmin = userName?.role === "admin";
  const defaultRegion = userName?.region;

  return (
    <div className="dashboard-bg">
    <Container className="py-5">
      {/* Page heading */}
      <header className="mb-4">
        <p className="text-muted mb-1">Welcome back, {userName}</p>
        <h1 className="h3 mb-2">Welcome to your Hub</h1>
        <p className="text-muted mb-0">
          Choose a dashboard area to explore your region’s data.
        </p>
      </header>

      <Row className="g-4 mb-4">
        {/* Spend */}
        <Col md={6} lg={4}>
          <Card className="h-100 dashboard-card shadow-sm border-0">
            <div className="dashboard-card-icon-wrapper dashboard-card-icon">
              <FontAwesomeIcon icon={faCoins} />
            </div>
            <Card.Body>
              <Card.Title className="h5">Visitor Spend</Card.Title>
              <Card.Text className="text-muted mb-3">
                Track where and how visitors are spending across your region.
              </Card.Text>
              <Button as={Link} to="/dashboard/spend" className="btn-localis-primary">
                View spend insights
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Accommodation */}
        <Col md={6} lg={4}>
          <Card className="h-100 dashboard-card shadow-sm border-0">
            <div className="dashboard-card-icon-wrapper dashboard-card-icon">
              <FontAwesomeIcon icon={faBed} />
            </div>
            <Card.Body>
              <Card.Title className="h5">Accommodation</Card.Title>
              <Card.Text className="text-muted mb-3">
                Explore occupancy trends, length of stay and seasonal patterns.
              </Card.Text>
              <Button as={Link} to="/dashboard/accommodation" className="btn-localis-primary">
                Explore accommodation
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Mobility */}
        <Col md={6} lg={4}>
          <Card className="h-100 dashboard-card shadow-sm border-0">
            <div className="dashboard-card-icon-wrapper dashboard-card-icon">
              <FontAwesomeIcon icon={faPlane} />
            </div>
            <Card.Body>
              <Card.Title className="h5">Visitor Movement</Card.Title>
              <Card.Text className="text-muted mb-3">
                Understand how visitors move in and out of your destination.
              </Card.Text>
              <Button as={Link} to="#" variant="light text-muted" size="sm">
                COMING SOON
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <LGASnapshot
        isAdmin={isAdmin}
        defaultRegion={defaultRegion}
      />
    </Container>
</div>
    
  );
}
