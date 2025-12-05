// client/src/App.js
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { Container, Modal } from "react-bootstrap";
import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Header from "./Components/header";
import Home from "./Pages/home";
import CompareOccupancy from "./Pages/compare_occupancy"
import ApiTest from "./Pages/api_test";
import Contact from "./Pages/Contact";
import Dashboard from "./Pages/Dashboard";
import Spend from "./Pages/spend";
import Login from "./Pages/auth/Login";
import Register from "./Pages/auth/Register";
import UserAdmin from "./Pages/admin/UserAdmin";  
import PrivateRoutes from "./routes/PrivateRoutes";
import Footer from "./Components/footer";
import "./index.css";
import Admin from "./Pages/Admin";
import FeedbackAdmin from "./Pages/admin/FeedbackAdmin";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <Header
          isLoggedIn={isLoggedIn}
          onLogOut={handleLogOut}
          role={localStorage.getItem("role")}
          onShowLogin={() => setShowLoginModal(true)}
          onShowRegister={() => setShowRegisterModal(true)}
        />

        {/* LOGIN MODAL */}
        <Modal
          show={showLoginModal}
          onHide={() => setShowLoginModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Log in</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Login
              setIsLoggedIn={setIsLoggedIn}
              onSuccess={() => setShowLoginModal(false)}
            />
          </Modal.Body>
        </Modal>

        {/* REGISTER MODAL */}
        <Modal
          show={showRegisterModal}
          onHide={() => setShowRegisterModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Register onSuccess={() => setShowRegisterModal(false)} />
          </Modal.Body>
        </Modal>

        <Container fluid className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />

            <Route
              path="/user/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/user/register" element={<Register />} />

            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/spend" element={<Spend />} />

              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/users" element={<UserAdmin />} />
              <Route path="/admin/feedback" element={<FeedbackAdmin />} />
            </Route>

            <Route
              path="*"
              element={<div className="text-muted p-4">Page not Found</div>}
            />
            <Route
              path="/compare-occupancy"
              element={<CompareOccupancy />}
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
