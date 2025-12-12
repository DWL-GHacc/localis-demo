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

  // If admin clicked Activate and we forced LGA modal first
  const [pendingActivateUserId, setPendingActivateUserId] = useState(null);

  // EDIT MODAL
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "user",
  });

  // LGA ACCESS MODAL
  const [allLgas, setAllLgas] = useState([]);
  const [lgaLoading, setLgaLoading] = useState(true);
  const [lgaError, setLgaError] = useState(null);

  const [showLgaModal, setShowLgaModal] = useState(false);
  const [lgaUser, setLgaUser] = useState(null);
  const [lgaScope, setLgaScope] = useState("all");
  const [userLgas, setUserLgas] = useState([]);

  // PASSWORD RESET
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwUser, setPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const isActiveFlag = (u) =>
    u.is_active === 1 || u.is_active === true || u.is_active === "1";

  // -------------------------------------------------------------
  // LOAD USERS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // LOAD ALL LGAs
  // -------------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        setLgaLoading(true);
        const { response, data } = await authFetch(
          "/api/length_data/distinct_lgas_length"
        );

        if (!response.ok || data?.Error) {
          throw new Error(data?.Message || "Failed to load LGA list");
        }

        const list = (data?.Data || [])
          .map((row) => row.lga_name)
          .filter(Boolean);

        setAllLgas(list);
      } catch (err) {
        console.error(err);
        setLgaError("Unable to load LGA list");
      } finally {
        setLgaLoading(false);
      }
    };

    load();
  }, []);

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  const hasAnyLgaAccess = (data) => {
    if (!data || data.error) return false;

    // ✅ key fix: scope=all means valid, even if lgas=[]
    if (data.scope === "all") return true;

    if (typeof data.assignedCount === "number") return data.assignedCount > 0;

    if (Array.isArray(data.lgas)) return data.lgas.length > 0;

    return false;
  };

  const fetchUserLgaAccess = async (id) => {
    const { response, data } = await authFetch(`/api/users/${id}/lgas`);
    return { response, data };
  };

  // -------------------------------------------------------------
  // LGA ACCESS HANDLERS
  // -------------------------------------------------------------
  const openLgaModal = async (user) => {
    setLgaUser(user);
    setUserLgas([]);
    setLgaScope("all");

    const { response, data } = await fetchUserLgaAccess(user.id);

    if (response.ok && !data?.error) {
      setLgaScope(data.scope || "all");
      setUserLgas(Array.isArray(data.lgas) ? data.lgas : []);
    }

    setShowLgaModal(true);
  };

  const saveLgaAccess = async ({ scope, lgas }) => {
    if (!lgaUser) return;

    const { response, data } = await authFetch(`/api/users/${lgaUser.id}/lgas`, {
      method: "PUT",
      body: JSON.stringify({ scope, lgas }),
    });

    if (!response.ok || data?.error) {
      alert(data?.message || "Failed to update LGA access");
      return;
    }

    setActionMessage("User LGA access updated");
    setShowLgaModal(false);

    const justUpdatedUserId = lgaUser.id;
    setLgaUser(null);

    // ✅ If we were trying to activate, re-check the server state first, then activate.
    if (pendingActivateUserId === justUpdatedUserId) {
      setPendingActivateUserId(null);

      const check = await fetchUserLgaAccess(justUpdatedUserId);
      if (!check.response.ok || !hasAnyLgaAccess(check.data)) {
        setActionMessage(
          "LGA access was not saved correctly. Please try again."
        );
        return;
      }

      await handleActivateDeactivate(justUpdatedUserId, true);
    }
  };

  // -------------------------------------------------------------
  // ACTIVATE / DEACTIVATE
  // -------------------------------------------------------------
  const handleActivateDeactivate = async (userOrId, makeActive) => {
    const id = typeof userOrId === "object" ? userOrId.id : userOrId;
    const userObj = typeof userOrId === "object" ? userOrId : null;

    if (makeActive) {
      // 1) Check current LGA access
      const check = await fetchUserLgaAccess(id);

      if (!check.response.ok || check.data?.error || !hasAnyLgaAccess(check.data)) {
        // 2) Force admin to assign LGAs first
        setPendingActivateUserId(id);

        if (userObj) {
          await openLgaModal(userObj);
        } else {
          setActionMessage(
            "Please assign LGAs before activating this user."
          );
        }
        return;
      }
    }

    const endpoint = makeActive
      ? `/api/users/${id}/activate`
      : `/api/users/${id}/deactivate`;

    const { response, data } = await authFetch(endpoint, { method: "PATCH" });

    if (!response.ok || data?.error) {
      // If backend blocks activation, also open modal
      if (makeActive && data?.code === "LGA_REQUIRED" && userObj) {
        setPendingActivateUserId(id);
        await openLgaModal(userObj);
        return;
      }

      setActionMessage(data?.message || "Failed to update user state");
      return;
    }

    setActionMessage(`User ${makeActive ? "activated" : "deactivated"}`);
    loadUsers();
  };

  // -------------------------------------------------------------
  // DELETE USER
  // -------------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    const { response, data } = await authFetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok || data?.error) {
      setActionMessage(data?.message || "Failed to delete user");
      return;
    }

    setActionMessage("User deleted");
    loadUsers();
  };

  // -------------------------------------------------------------
  // EDIT USER
  // -------------------------------------------------------------
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || "",
      role: user.role || "user",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const { response, data } = await authFetch(
      `/api/users/${editingUser.id}/update`,
      {
        method: "PATCH",
        body: JSON.stringify(editForm),
      }
    );

    if (!response.ok || data?.error) {
      setActionMessage(data?.message || "Failed to update user");
      return;
    }

    setActionMessage("User updated successfully");
    setShowEditModal(false);
    loadUsers();
  };

  // -------------------------------------------------------------
  // PASSWORD RESET
  // -------------------------------------------------------------
  const openPasswordModal = (user) => {
    setPwUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setShowPwModal(true);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setPwError("Password must be 8 characters minimum");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }

    const { response, data } = await authFetch(
      `/api/users/${pwUser.id}/password`,
      {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      }
    );

    if (!response.ok || data?.error) {
      setPwError(data?.message || "Failed to update password");
      return;
    }

    setActionMessage(`Password updated for ${pwUser.email}`);
    setShowPwModal(false);
  };

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">User Administration</h1>

      {/* FILTER BUTTONS */}
      <div className="btn-group mb-3">
        <button
          className={`btn btn-outline-primary ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>

        <button
          className={`btn btn-outline-primary ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>

        <button
          className={`btn btn-outline-primary ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>

      {loading && <p>Loading users…</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {actionMessage && <div className="alert alert-info">{actionMessage}</div>}
      {lgaError && <div className="alert alert-warning">{lgaError}</div>}

      {!loading && !error && users.length > 0 && (
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ minWidth: "260px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.full_name}</td>
                <td>{u.role}</td>
                <td>
                  {isActiveFlag(u) ? (
                    <Badge bg="success">Active</Badge>
                  ) : (
                    <Badge bg="secondary">Pending</Badge>
                  )}
                </td>

                <td className="d-flex gap-2 flex-wrap">
                  {/* EDIT */}
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => openEditModal(u)}
                  >
                    Edit
                  </Button>

                  {/* LGA ACCESS */}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openLgaModal(u)}
                    disabled={lgaLoading}
                  >
                    LGAs
                  </Button>

                  {/* PW RESET */}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openPasswordModal(u)}
                  >
                    Update PW
                  </Button>

                  {/* ACTIVATE / DEACTIVATE */}
                  {isActiveFlag(u) ? (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleActivateDeactivate(u.id, false)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleActivateDeactivate(u, true)}
                    >
                      Activate
                    </Button>
                  )}

                  {/* DELETE */}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* PASSWORD RESET MODAL */}
      <Modal show={showPwModal} onHide={() => setShowPwModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password {pwUser && `(${pwUser.email})`}</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handlePasswordReset}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            {pwError && <div className="text-danger small mt-2">{pwError}</div>}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPwModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" type="submit">
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* EDIT USER MODAL */}
      <EditUserModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        editingUser={editingUser}
        editForm={editForm}
        onChange={handleEditChange}
        onSubmit={handleUpdateUser}
      />

      {/* LGA ACCESS MODAL */}
      <AssignLgaModal
        show={showLgaModal}
        onHide={() => setShowLgaModal(false)}
        user={lgaUser}
        allLgas={allLgas}
        initialScope={lgaScope}
        initialLgas={userLgas}
        onSave={saveLgaAccess}
      />
    </div>
  );
};

export default UserAdmin;
