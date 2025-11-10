import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";


export default function Header({ isLoggedIn, onLogOut }) {

  return (
    <header>
      <Navbar bg="body" expand="md">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="d-flex p-2"><img src="../images/localis-dih-blk.svg" alt="Logo" width="300" height="auto"></img></Navbar.Brand> {/*Take back to homepage if click logo */}
          <Navbar.Toggle aria-controls="navbarSupportedContent" />
          <Navbar.Collapse id="navbarSupportedContent">
            <Nav className="me-auto">
              <NavLink to="/" className="nav-link">Home</NavLink>
            </Nav>
            <Nav>
                {!isLoggedIn && <NavLink to="/user/login" className="nav-link">Login</NavLink>}
                {!isLoggedIn && <NavLink to="/user/register" className="nav-link">Register</NavLink>}
                {isLoggedIn && (<button onClick={onLogOut} className="btn btn-lg">Logout</button>
                )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}