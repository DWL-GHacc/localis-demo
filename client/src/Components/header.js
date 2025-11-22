// client/src/Components/header.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const Header = ({ isLoggedIn, onLogOut, role, onShowLogin, onShowRegister }) => {
  const navigate = useNavigate();
  const isAdmin = role === "admin";

  const handleLogoutClick = () => {
    if (onLogOut) {
      onLogOut();
    }
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Localis Prototype
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            {/* Always visible */}
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>

            {/* Dashboard visible only when logged in */}
            {isLoggedIn && (
              <Nav.Link as={Link} to="/dashboard">
                Dashboard
              </Nav.Link>
            )}

            {/* ADMIN HUB LINK */}
            {isLoggedIn && isAdmin && (
              <Nav.Link as={Link} to="/admin">
                Admin
              </Nav.Link>
            )}
          </Nav>

          {/* RIGHT SIDE — Login / Register or Logout */}
          <Nav className="ms-auto">
            {!isLoggedIn && (
              <>
                <Button
                  variant="outline-light"
                  size="sm"
                  className="me-2"
                  onClick={onShowLogin}
                >
                  Log in
                </Button>

                <Button
                  variant="light"
                  size="sm"
                  onClick={onShowRegister}
                >
                  Register
                </Button>
              </>
            )}

            {isLoggedIn && (
              <>
                <Navbar.Text className="me-3">
                  Signed in as{" "}
                  <strong>{localStorage.getItem("userName") || "User"}</strong>
                </Navbar.Text>

                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogoutClick}
                >
                  Log out
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
