// client/src/Components/Footer.jsx
import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const Footer = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    feedback_type: "general",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const handleOpen = () => {
  const storedName = localStorage.getItem("userName") || "";
  const storedEmail = localStorage.getItem("userEmail") || "";

  setFormData((prev) => ({
    ...prev,
    user_name: storedName || prev.user_name,
    user_email: storedEmail || prev.user_email,
  }));

  setShowFeedback(true);
  setSubmitError(null);
  setSubmitSuccess(null);
};


  const handleClose = () => {
    setShowFeedback(false);
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setSubmitError(null);
  setSubmitSuccess(null);

  const token = localStorage.getItem("token");

  if (!token) {
    setSubmitError("You must be logged in to send feedback.");
    setSubmitting(false);
    return;
  }

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ⭐ REQUIRED
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      throw new Error(data?.message || "Failed to submit feedback.");
    }

    setSubmitSuccess("Thank you! Your feedback has been submitted.");

    // Reset fields but keep stored values
    setFormData({
      user_name: localStorage.getItem("userName") || "",
      user_email: localStorage.getItem("userEmail") || "",
      feedback_type: "general",
      message: "",
    });
  } catch (err) {
    setSubmitError(err.message || "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
};


  return (
    <>
      <footer className="bg-dark text-light p-3 mt-auto text-center">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="small">
            © {new Date().getFullYear()} Localis Prototype
          </span>

          <Button
            variant="outline-light"
            size="sm"
            onClick={handleOpen}
          >
            Send Feedback
          </Button>
        </div>
      </footer>

      <Modal show={showFeedback} onHide={handleClose} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Send Feedback</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                name="user_name"
                placeholder="Your full name"
                value={formData.user_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Email</Form.Label>
              <Form.Control
                type="email"
                name="user_email"
                placeholder="you@example.com"
                value={formData.user_email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Feedback Type</Form.Label>
              <Form.Select
                name="feedback_type"
                value={formData.feedback_type}
                onChange={handleChange}
                required
              >
                <option value="bug">Bug – Something is broken</option>
                <option value="feature_request">Feature Request</option>
                <option value="data_issue">Data Issue</option>
                <option value="ui_ux">UI / UX</option>
                <option value="general">General</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                placeholder="Tell us about your feedback..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Submit"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Footer;

