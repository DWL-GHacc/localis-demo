// client/src/Pages/admin/UserAdmin.jsx
import { useState, useEffect, useCallback } from "react";
import { authFetch } from "../../API/authClient";
import EditUserModal from "./EditUserModal";
import AssignLgaModal from "./AssignLgaModal"; 
import { Table, Button, Modal, Form, Badge } from "react-bootstrap";

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "user",
  });
const [allLgas, setAllLgas] = useState([]);
const [lgaLoading, setLgaLoading] = useState(true);
const [lgaError, setLgaError] = useState(null);

const [showLgaModal, setShowLgaModal] = useState(false);
const [lgaUser, setLgaUser] = useState(null);
const [lgaScope, setLgaScope] = useState("all");
const [userLgas, setUserLgas] = useState([]);
  // --- Password reset modal state ---
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwUser, setPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const isActiveFlag = (u) =>
    u.is_active === 1 || u.is_active === true || u.is_active === "1";

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setActionMessage(null);

      const extractUsers = (data) =>
        data && Array.isArray(data.users) ? data.users : [];

      let finalList = [];

      if (filter === "active" || filter === "all") {
        const { response, data } = await authFetch("/api/users/active");
        if (!response.ok || data?.error) {
          throw new Error(data?.message || "Failed to load active users");
        }
        finalList = finalList.concat(extractUsers(data));
      }

      if (filter === "pending" || filter === "all") {
        const { response, data } = await authFetch("/api/users/pending");
        if (!response.ok || data?.error) {
          throw new Error(data?.message || "Failed to load pending users");
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
  }, [filter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleActivateDeactivate = async (userId, makeActive) => {
    try {
      setActionMessage(null);

      const endpoint = makeActive
        ? `/api/users/${userId}/activate`
        : `/api/users/${userId}/deactivate`;

      const { response, data } = await authFetch(endpoint, {
        method: "PATCH",
      });

      if (!response.ok || data?.error) {
        setActionMessage(
          data?.message ||
            data?.error ||
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

      if (!response.ok || data?.error) {
        setActionMessage(
          data?.message || data?.error || "Failed to delete user"
        );
        return;
      }

      setActionMessage("User deleted");
      loadUsers();
    } catch (err) {
      console.error(err);
      setActionMessage("Server/network error deleting user");
    }
  };

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
    setEditForm((prev) => ({ ...prev, [name]: value }));
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

  // --- Password reset handlers ---

  const openPasswordModal = (user) => {
    setPwUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setShowPwModal(true);
  };

  const closePasswordModal = () => {
    setShowPwModal(false);
    setPwUser(null);
    setPwError("");
    setPwLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPwError("");

    if (!newPassword || newPassword.length < 8) {
      setPwError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    if (!pwUser) {
      setPwError("No user selected.");
      return;
    }

    try {
      setPwLoading(true);
      const { response, data } = await authFetch(
        `/api/users/${pwUser.id}/password`,
        {
          method: "PATCH",
          body: JSON.stringify({ password: newPassword }),
        }
      );

      if (!response.ok || data?.error) {
        throw new Error(data?.message || data?.error || "Failed to update password");
      }

      setActionMessage(`Password updated for ${pwUser.email}`);
      closePasswordModal();
    } catch (err) {
      console.error(err);
      setPwError(err.message || "Error updating password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">User Administration</h1>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/admin">Admin</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            User Administration
          </li>
        </ol>
      </nav>

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
      {actionMessage && (
        <div className="alert alert-info">{actionMessage}</div>
      )}

      {!loading && !error && users.length === 0 && (
        <p>No users found for this filter.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="table-responsive">
          <Table striped bordered hover size="sm" className="align-middle">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Active</th>
                <th style={{ minWidth: "260px" }}>Actions</th>
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
                        <Badge bg="success">Active</Badge>
                      ) : (
                        <Badge bg="secondary">Pending</Badge>
                      )}
                    </td>
                    <td className="d-flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        type="button"
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() => openPasswordModal(u)}
                      >
                        Update PW
                      </Button>

                      {active ? (
                        <Button
                          size="sm"
                          variant="warning"
                          type="button"
                          onClick={() =>
                            handleActivateDeactivate(u.id, false)
                          }
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          type="button"
                          onClick={() =>
                            handleActivateDeactivate(u.id, true)
                          }
                        >
                          Activate
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline-danger"
                        type="button"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Password Reset Modal */}
      <Modal show={showPwModal} onHide={closePasswordModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Reset Password
            {pwUser && (
              <span className="ms-2 text-muted" style={{ fontSize: "0.9rem" }}>
                ({pwUser.email})
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordReset}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <Form.Text muted>Minimum 8 characters.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </Form.Group>

            {pwError && (
              <div className="text-danger small mt-1">{pwError}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closePasswordModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={pwLoading}>
              {pwLoading ? "Updating..." : "Update Password"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <EditUserModal
        show={showEditModal}
        onHide={closeEditModal}
        editingUser={editingUser}
        editForm={editForm}
        onChange={handleEditChange}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
};

export default UserAdmin;
