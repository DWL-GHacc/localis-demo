import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";

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
    <Navbar bg="light" variant="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex p-2">
          <img
            src="/images/localis-dih-blk.svg"
            alt="Localis Destination Insight Hub logo"
            width="300"
            height="auto"
          />
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

            {/* ADMIN DROPDOWN (admins only) */}
            {isLoggedIn && isAdmin && (
              <NavDropdown title="Admin" id="admin-nav-dropdown">
                <NavDropdown.Item as={Link} to="/admin/users">
                  User Admin
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/feedback">
                  Feedback Admin
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          {/* RIGHT SIDE — Login / Register or Logout */}
          <Nav className="ms-auto">
            {!isLoggedIn && (
              <>
                <Button
                  variant="dark"
                  size="sm"
                  className="me-2"
                  onClick={onShowLogin}
                >
                  Log in
                </Button>

                <Button variant="dark" size="sm" onClick={onShowRegister}>
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

                <Button variant="dark" size="sm" onClick={handleLogoutClick}>
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
