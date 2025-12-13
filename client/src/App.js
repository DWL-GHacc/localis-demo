// client/src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Container, Modal } from "react-bootstrap";
import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Header from "./Components/header";
import Home from "./Pages/home";
import AccommodationInSights from "./Pages/accomodation_insights";
import ApiTest from "./Pages/api_test";
import Dashboard from "./Pages/Dashboard";
import Spend from "./Pages/spend";
import Login from "./Pages/auth/Login";
import Register from "./Pages/auth/Register";
import UserAdmin from "./Pages/admin/UserAdmin";
import PrivateRoutes from "./routes/PrivateRoutes";
import Footer from "./Components/footer";
import "./index.css";
import FeedbackAdmin from "./Pages/admin/FeedbackAdmin";
import Demo from "./Pages/Demo";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("lgaAccess");
    setIsLoggedIn(false);
  };

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  const openRegisterModal = () => setShowRegisterModal(true);
  const closeRegisterModal = () => setShowRegisterModal(false);

  // ✅ NEW: switch Register modal -> Login modal (no page navigation)
  const switchRegisterToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  // (optional) also allow switching the other way if you add it later
  // const switchLoginToRegister = () => {
  //   setShowLoginModal(false);
  //   setShowRegisterModal(true);
  // };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header
          isLoggedIn={isLoggedIn}
          onLogOut={handleLogOut}
          role={localStorage.getItem("role")}
          onShowLogin={openLoginModal}
          onShowRegister={openRegisterModal}
        />

        {/* LOGIN MODAL */}
        <Modal show={showLoginModal} onHide={closeLoginModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Log in</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Login setIsLoggedIn={setIsLoggedIn} onSuccess={closeLoginModal} />
          </Modal.Body>
        </Modal>

        {/* REGISTER MODAL */}
        <Modal show={showRegisterModal} onHide={closeRegisterModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Register
              onSuccess={closeRegisterModal}
              onSwitchToLogin={switchRegisterToLogin} // ✅ PASS THIS
            />
          </Modal.Body>
        </Modal>

        <Container fluid className="flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  onShowRegister={openRegisterModal}
                  onShowLogin={openLoginModal}
                />
              }
            />

            <Route path="/demo" element={<Demo />} />

            {/* Optional direct-page routes can remain */}
            <Route
              path="/user/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/user/register" element={<Register />} />

            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/spend" element={<Spend />} />
              <Route path="/admin/users" element={<UserAdmin />} />
              <Route path="/admin/feedback" element={<FeedbackAdmin />} />
            </Route>

            <Route
              path="*"
              element={<div className="text-muted p-4">Page not Found</div>}
            />
            <Route
              path="/accomodation_insights"
              element={<AccommodationInSights />}
            ></Route>
            <Route path="/api_test" element={<ApiTest />}></Route>
          </Routes>
        </Container>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
