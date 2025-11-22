// client/src/App.js

import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";
import { Container, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Header from "./Components/header";
import Home from "./Pages/home";
import "./index.css";

// -------------------- API CONFIG + HELPER --------------------

const API_BASE = "http://localhost:3000";

const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { response, data };
};

// -------------------- LAYOUT STUBS --------------------

const Footer = () => (
  <footer className="bg-dark text-light text-center p-3 mt-auto">
    Footer Stub
  </footer>
);

const Contact = () => (
  <div className="p-3">
    <h1 className="h4 mb-3">Contact</h1>
    <p>Contact page stub.</p>
  </div>
);

const Data = () => (
  <div className="p-3">
    <h1 className="h4 mb-3">Dashboard</h1>
    <p>Dashboard content stub.</p>
  </div>
);

// -------------------- AUTH / ROUTE GUARD --------------------

const PrivateRoutes = () => {
  const hasToken = !!localStorage.getItem("token");

  return hasToken ? (
    <Outlet />
  ) : (
    <section className="p-4 text-center">
      <h1 className="h4 mb-3">Authorisation required</h1>
      <p className="mb-3">
        You must be logged in to view this page. Please log in below.
      </p>
      <Link to="/user/login" className="btn btn-primary">
        Go to Login
      </Link>
    </section>
  );
};

// -------------------- LOGIN PAGE --------------------

const Login = ({ setIsLoggedIn, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      // Store auth info
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role || "");
      localStorage.setItem("userName", user.full_name || user.email || "");

      setIsLoggedIn(true);
      navigate("/dashboard");

      if (onSuccess) {
        onSuccess(); // close modal when used in a popup
      }
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
        <div className="mb-3">
          <label className="form-label" htmlFor="email">
            Email
          </label>
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

        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Password
          </label>
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

// -------------------- REGISTER PAGE --------------------

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      if (onSuccess) {
        onSuccess(); // close modal when used in popup
      }
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
          <label htmlFor="fullName" className="form-label">
            Full name
          </label>
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
          <label htmlFor="email" className="form-label">
            Email address
          </label>
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
          <label htmlFor="password" className="form-label">
            Password
          </label>
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



// -------------------- USER ADMIN PAGE --------------------

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("active"); // active | pending | all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // NEW: edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "user",
  });

  const extractUsers = (data) => {
    if (!data) return [];
    if (Array.isArray(data.users)) return data.users;
    return [];
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setActionMessage(null);

      let finalList = [];

      if (filter === "active" || filter === "all") {
        const { response, data } = await authFetch("/api/users/active");

        if (!response.ok || data.error) {
          throw new Error(data.message || "Failed to load active users");
        }

        finalList = finalList.concat(extractUsers(data));
      }

      if (filter === "pending" || filter === "all") {
        const { response, data } = await authFetch("/api/users/pending");

        if (!response.ok || data.error) {
          throw new Error(data.message || "Failed to load pending users");
        }

        finalList = finalList.concat(extractUsers(data));
      }

      setUsers(finalList);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const isActiveFlag = (u) =>
    u.is_active === 1 || u.is_active === true || u.is_active === "1";

  const handleActivateDeactivate = async (userId, makeActive) => {
    try {
      setActionMessage(null);

      const endpoint = makeActive
        ? `/api/users/${userId}/activate`
        : `/api/users/${userId}/deactivate`;

      const { response, data } = await authFetch(endpoint, {
        method: "PATCH",
      });

      if (!response.ok || data.error) {
        setActionMessage(
          data.message ||
            data.error ||
            `Failed to ${makeActive ? "activate" : "deactivate"} user`
        );
        return;
      }

      setActionMessage(
        `User ${makeActive ? "activated" : "deactivated"} successfully`
      );
      loadUsers();
    } catch (err) {
      console.error(err);
      setActionMessage("Server/network error updating user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const { response, data } = await authFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok || data.error) {
        setActionMessage(data.message || data.error || "Failed to delete user");
        return;
      }

      setActionMessage("User deleted");
      loadUsers();
    } catch (err) {
      console.error(err);
      setActionMessage("Server/network error deleting user");
    }
  };

  // ----------- EDIT MODAL LOGIC -----------

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || "",
      role: user.role || "user",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setActionMessage(null);

      const { response, data } = await authFetch(
        `/api/users/${editingUser.id}/update`,
        {
          method: "PATCH",
          body: JSON.stringify({
            full_name: editForm.full_name,
            role: editForm.role,
          }),
        }
      );

      if (!response.ok || data?.error) {
        setActionMessage(
          data?.message || data?.error || "Failed to update user"
        );
        return;
      }

      setActionMessage("User updated successfully");
      closeEditModal();
      loadUsers();
    } catch (err) {
      console.error(err);
      setActionMessage("Server/network error updating user");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">User Administration</h1>

      <div className="btn-group mb-3">
        <button
          className={`btn btn-outline-primary ${
            filter === "active" ? "active" : ""
          }`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`btn btn-outline-primary ${
            filter === "pending" ? "active" : ""
          }`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`btn btn-outline-primary ${
            filter === "all" ? "active" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>

      {loading && <p>Loading users…</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {actionMessage && <div className="alert alert-info">{actionMessage}</div>}

      {!loading && !error && users.length === 0 && (
        <p>No users found for this filter.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm table-striped">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const active = isActiveFlag(u);

                return (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.full_name}</td>
                    <td>{u.role}</td>
                    <td>
                      {active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Pending</span>
                      )}
                    </td>
                    <td className="d-flex gap-2 flex-wrap">
                      {/* EDIT BUTTON (opens modal) */}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </button>

                      {/* Activate / Deactivate */}
                      {active ? (
                        <button
                          className="btn btn-sm btn-warning"
                          type="button"
                          onClick={() => handleActivateDeactivate(u.id, false)}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-success"
                          type="button"
                          onClick={() => handleActivateDeactivate(u.id, true)}
                        >
                          Activate
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        type="button"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT USER MODAL */}
      <Modal show={showEditModal} onHide={closeEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="mb-3">
                <label htmlFor="full_name" className="form-label">
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="form-control"
                  value={editForm.full_name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={editForm.role}
                  onChange={handleEditChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};


// -------------------- MAIN APP --------------------

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
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
            <Route path="/contact-us" element={<Contact />} />

            {/* Page routes still work if you navigate directly */}
            <Route
              path="/user/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route path="/user/register" element={<Register />} />

            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<Data />} />
              <Route path="/admin/users" element={<UserAdmin />} />
            </Route>

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

export default App;
