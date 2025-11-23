// client/src/Pages/auth/Register.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../../api/authClient";

const Register = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessage(data.error || data.message || "Registration failed");
        return;
      }

      setMessage(
        "Registration submitted successfully. You may need to wait for activation."
      );

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while registering.");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <h1 className="h4 mb-3">Register a new account</h1>
      <p className="text-muted mb-4">
        Fill in the details below to request access to the Localis dashboard.
      </p>

      {message && <div className="alert alert-info py-2">{message}</div>}

      <form onSubmit={handleSubmit}>
        {/* Full name */}
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">Full name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-control"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="form-text">
            This will be used as your login username.
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
          <div className="form-text">Use at least 8 characters.</div>
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-control"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Submit registration
        </button>
      </form>

      <p className="mt-3 mb-0">
        Already have an account? <Link to="/user/login">Go back to login</Link>
      </p>
    </div>
  );
};

export default Register;
