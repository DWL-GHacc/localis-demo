import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


import Header from "./Components/header";
import Home from "./Pages/home";

//Temp stubs
const Footer = () => (
  <footer className="bg-dark text-light text-center p-3 mt-auto">
    Footer Stub
  </footer>
);

const Contact = () => <div className="p-3">Contact Page Stub</div>;
const Data = () => <div className="p-3">Protected Data Page Stub</div>;
const Login = ({ setIsLoggedIn }) => (
  <div className="p-3">
    Login Stub <br />
    <button
      className="btn btn-success mt-2"
      onClick={() => {
        localStorage.setItem("token", "fake-token");
        setIsLoggedIn(true);
      }}
    >
      Log In
    </button>
  </div>
);
const Register = () => <div className="p-3">Register Page Stub</div>;

// Private Routes
const PrivateRoutes = () => {
  const hasToken = !!localStorage.getItem("token");
  return hasToken ? (
    <Outlet />
  ) : (
    <section className="py-5 text-center">
      <h1 className="h4 mb-3">Dashboard</h1>
      <div className="alert alert-warning d-inline-block">
        This page is protected. Please{" "}
        <Link to="/user/login" className="alert-link">
          Log in
        </Link>{" "}
        to continue.
      </div>
    </section>
  );
};

// Main routes
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  function handleLogOut() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100 bg-light" id="wrapper">
        <Header isLoggedIn={isLoggedIn} onLogOut={handleLogOut} />

        <Container fluid className="pt-2 flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<Data />} />
            </Route>

            <Route path="/contact-us" element={<Contact />} />
            <Route
              path="/user/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/user/register" element={<Register />} />

            <Route
              path="*"
              element={<div className="text-muted p-4">Page not Found</div>}
            />
          </Routes>
        </Container>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
