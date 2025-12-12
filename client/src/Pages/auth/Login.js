// client/src/Pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Modal } from "react-bootstrap";
import { authFetch } from "../../API/authClient"; 

export default function Login({ setIsLoggedIn, onSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ✅ Inactive/403 modal state
  const [showInactive, setShowInactive] = useState(false);
  const [inactiveMessage, setInactiveMessage] = useState(
    "Your account exists, but it has not yet been activated by an administrator."
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { response, data } = await authFetch("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // ✅ Any 403 => show modal (covers inactive accounts cleanly)
      if (response.status === 403) {
        setInactiveMessage(
          data?.message ||
            "Your account exists, but it has not yet been activated by an administrator."
        );
        setShowInactive(true);
        return;
      }

      // Other errors
      if (!response.ok || data?.error) {
        setError(data?.message || "Login failed");
        return;
      }

      // Success: persist auth + user
      localStorage.setItem("token", data.token);

      if (data?.user?.role) localStorage.setItem("role", data.user.role);
      if (data?.user?.full_name) localStorage.setItem("userName", data.user.full_name);
      if (data?.user?.email) localStorage.setItem("userEmail", data.user.email);

      // Optional: store LGA access if you use it client-side
      if (data?.user?.lgaAccess !== undefined) {
        localStorage.setItem("lgaAccess", JSON.stringify(data.user.lgaAccess));
      }

      if (typeof setIsLoggedIn === "function") setIsLoggedIn(true);

      // close modal if provided (App.js passes onSuccess to close the login modal)
      if (typeof onSuccess === "function") onSuccess();

      // navigate to dashboard (optional, but typical)
      navigate("/dashboard");
    } catch (err) {
      setError("Network or server error while logging in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="loginEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="loginPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </Form.Group>

        <div className="d-grid">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </div>
      </Form>

      {/* ✅ 403 / ACCOUNT INACTIVE MODAL */}
      <Modal show={showInactive} onHide={() => setShowInactive(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Account not active yet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">{inactiveMessage}</p>
          <p className="mb-0">
            Please try again later, or contact your administrator to activate your account.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInactive(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
