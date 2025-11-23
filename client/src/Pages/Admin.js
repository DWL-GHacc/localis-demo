// client/src/Pages/Admin.js

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Button, Row, Col } from "react-bootstrap";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-4">

      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb mb-1">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Admin
          </li>
        </ol>
      </nav>

      <h1 className="h4 mb-3">Administration</h1>
      <p className="text-muted mb-4">
        Select an administration section to manage:
      </p>

      <Row className="g-3">
        {/* User Admin Card */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>User Administration</Card.Title>
              <Card.Text className="flex-grow-1">
                Activate accounts, manage roles, and update user details.
              </Card.Text>
              <Button
                variant="primary"
                className="mt-auto"
                onClick={() => navigate("/admin/users")}
              >
                Go to User Admin
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Feedback Admin Card */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Feedback Administration</Card.Title>
              <Card.Text className="flex-grow-1">
                View and filter feedback submitted by users.
              </Card.Text>
              <Button
                variant="outline-primary"
                className="mt-auto"
                onClick={() => navigate("/admin/feedback")}
              >
                Go to Feedback Admin
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Admin;

