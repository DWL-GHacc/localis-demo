// client/src/Components/header.jsx

import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Header({
  isLoggedIn,
  onLogOut,
  role,
  onShowLogin,
  onShowRegister,
}) {
  const navigate = useNavigate();
  const isAdmin = role === "admin";

  const handleLogoutClick = () => {
    if (onLogOut) {
      onLogOut();
    }
    navigate("/");
  };

  return (
    <header>
      <Navbar bg="muted" expand="md">
        <Container fluid>
          {/* Logo – click to go home */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex p-2"
          >
            <img
              src="/images/localis-dih-blk.svg"
              alt="Localis Destination Insight Hub logo"
              width="300"
              height="auto"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbarSupportedContent" />
          <Navbar.Collapse id="navbarSupportedContent">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end>
                Home
              </Nav.Link>

              {isLoggedIn && (
                <Nav.Link as={NavLink} to="/dashboard">
                  Dashboard
                </Nav.Link>
              )}

              {isLoggedIn && isAdmin && (
                <Nav.Link as={NavLink} to="/admin">
                  Admin
                </Nav.Link>
              )}
            </Nav>

            <Nav className="ms-auto align-items-center">
              {!isLoggedIn && (
                <>
                  <Button
                    variant="outline-dark"
                    size="sm"
                    className="me-2"
                    onClick={onShowLogin}
                  >
                    Log in
                  </Button>

                  <Button
                    variant="dark"
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
                    variant="outline-dark"
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
    </header>
  );
}
