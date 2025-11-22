import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";

export default function Header({ isLoggedIn, onLogOut, role }) {

  return (
    <header>
      <Navbar bg="body" expand="md">
        <Container fluid>

          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex p-2">
            <img
              src="../images/localis-dih-blk.svg"
              alt="Logo"
              width="300"
              height="auto"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="navbarSupportedContent" />

          <Navbar.Collapse id="navbarSupportedContent">

            {/* Left-side navigation */}
            <Nav className="me-auto">
              <NavLink to="/" className="nav-link">Home</NavLink>
            </Nav>

            {/* Right-side navigation */}
            <Nav>

              {/* Logged-out view */}
              {!isLoggedIn && (
                <>
                  <NavLink to="/user/login" className="nav-link">Login</NavLink>
                  <NavLink to="/user/register" className="nav-link">Register</NavLink>
                </>
              )}

              {/* Logged-in view */}
              {isLoggedIn && (
                <>
                  {/* DASHBOARD link */}
                  <NavLink to="/dashboard" className="nav-link">
                    Dashboard
                  </NavLink>

                  {/* ADMIN ONLY BUTTON */}
                  {role === "admin" && (
                    <NavLink to="/admin/users" className="nav-link text-warning fw-bold">
                      User Admin
                    </NavLink>
                  )}

                  {/* Logout button */}
                  <button onClick={onLogOut} className="btn btn-lg">
                    Logout
                  </button>
                </>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
