// client/src/Pages/auth/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../../API/authClient";

const Login = ({ setIsLoggedIn, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessage(data.message || data.error || "Login failed");
        return;
      }

      const { token, user } = data;
      if (!token || !user) {
        setMessage("Invalid response from server (missing token or user).");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role || "");
      localStorage.setItem("userName", user.full_name || user.email || "");

      if (setIsLoggedIn) setIsLoggedIn(true);

      // default after login
      navigate("/dashboard");

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setMessage("Network or server error while logging in.");
    }
  };

  return (
    <div className="p-3" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h1 className="h4 mb-3">Log in</h1>

      {message && <div className="alert alert-danger py-2">{message}</div>}

      <form onSubmit={handleSubmit}>
        {/* email */}
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* password */}
        <div className="mb-3">
          <label className="form-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Log in
        </button>
      </form>

      <hr className="my-4" />

      <p className="text-center mb-2">New to Localis?</p>
      <div className="d-grid">
        <Link to="/user/register" className="btn btn-outline-primary">
          Register as a new user
        </Link>
      </div>
    </div>
  );
};

export default Login;
