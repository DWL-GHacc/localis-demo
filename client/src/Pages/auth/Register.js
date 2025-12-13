// client/src/Pages/auth/Register.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";

// IMPORTANT:
// Use the same import path/casing you use elsewhere in your project.
// If your folder is /src/API (uppercase), use "../../API/authClient"
import { authFetch } from "../../API/authClient";

export default function Register({ onSuccess, onSwitchToLogin }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // ✅ modal flow: switch to login modal
    if (onSwitchToLogin) return onSwitchToLogin();

    // fallback: page navigation
    navigate("/user/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        email: email.trim(),
        password,
        full_name: fullName.trim() || undefined,
      };

      const { response, data } = await authFetch("/api/users/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(data?.message || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(
        data?.message ||
          "Registration submitted. An administrator may need to activate your account."
      );

      // ✅ If you're using the modal: close it
      if (onSuccess) onSuccess();

      // If this Register component is used as a page, you can optionally redirect:
      // navigate("/user/login");
    } catch (err) {
      setError("Network or server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success">{successMsg}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="registerFullName">
          <Form.Label>Full name (optional)</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. David Leary"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="you@council.nsw.gov.au"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button type="submit" variant="success" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating account...
              </>
            ) : (
              "Request Access"
            )}
          </Button>

          <Button
            type="button"
            variant="link"
            className="p-0"
            onClick={handleSwitchToLogin}
             >
            Already have an account? Log in
          </Button>
        </div>
      </Form>
    </>
  );
}
