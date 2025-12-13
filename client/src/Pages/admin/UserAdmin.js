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

  // EDIT MODAL
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: "", role: "user" });

  // LGA MODAL
  const [allLgas, setAllLgas] = useState([]);
  const [lgaLoading, setLgaLoading] = useState(true);
  const [showLgaModal, setShowLgaModal] = useState(false);
  const [lgaUser, setLgaUser] = useState(null);
  const [userLgas, setUserLgas] = useState([]);

  // PASSWORD RESET
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwUser, setPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  const isActiveFlag = (u) => u.is_active === 1 || u.is_active === true || u.is_active === "1";

  // LOAD USERS
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setActionMessage(null);

      const extractUsers = (data) => (data && Array.isArray(data.users) ? data.users : []);
      let finalList = [];

      if (filter === "active" || filter === "all") {
        const { response, data } = await authFetch("/api/users/active");
        if (!response.ok || data?.error) throw new Error(data?.message || "Failed to load active users");
        finalList = finalList.concat(extractUsers(data));
      }

      if (filter === "pending" || filter === "all") {
        const { response, data } = await authFetch("/api/users/pending");
        if (!response.ok || data.error) {
          throw new Error(data.message || "Failed to load pending users");
        }
        finalList = extractUsers(data);
      } else if (filter === "all") {
        // Fetch active + pending in parallel and merge
        const [activeResult, pendingResult] = await Promise.all([
          authFetch("/api/users/active"),
          authFetch("/api/users/pending"),
        ]);

        const { response: activeRes, data: activeData } = activeResult;
        const { response: pendingRes, data: pendingData } = pendingResult;

        if (!activeRes.ok || activeData.error) {
          throw new Error(
            activeData.message || "Failed to load active users"
          );
        }

        if (!pendingRes.ok || pendingData.error) {
          throw new Error(
            pendingData.message || "Failed to load pending users"
          );
        }

        finalList = [
          ...extractUsers(activeData),
          ...extractUsers(pendingData),
        ];
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

  // LOAD ALL LGAs (same as you already do)
  useEffect(() => {
    const load = async () => {
      try {
        setLgaLoading(true);
        const { response, data } = await authFetch("/api/length_data/distinct_lgas_length");
        if (!response.ok || data?.Error) throw new Error(data?.Message || "Failed to load LGA list");

        const list = (data?.Data || []).map((row) => row.lga_name).filter(Boolean);
        setAllLgas(list);
      } catch (err) {
        console.error(err);
        setAllLgas([]);
      } finally {
        setLgaLoading(false);
      }
    };
    load();
  }, []);

  // OPEN LGA MODAL (load assigned from DB)
  const openLgaModal = async (user) => {
    setLgaUser(user);
    setUserLgas([]);
    setActionMessage(null);

    const { response, data } = await authFetch(`/api/users/${user.id}/lgas`);
    if (response.ok && !data?.error) {
      setUserLgas(Array.isArray(data.lgas) ? data.lgas : []);
    }

    setShowLgaModal(true);
  };

  // SAVE LGA ACCESS (replace)
  const saveLgaAccess = async ({ lgas }) => {
    if (!lgaUser) return;

    const { response, data } = await authFetch(`/api/users/${lgaUser.id}/lgas`, {
      method: "PUT",
      body: JSON.stringify({ lgas }),
    });

    if (!response.ok || data?.error) {
      alert(data?.message || "Failed to update LGA access");
      return;
    }

    setActionMessage(`LGA access updated (${data?.assignedCount ?? lgas.length} selected)`);
    setShowLgaModal(false);
    setLgaUser(null);
  };

  // ACTIVATE / DEACTIVATE (NO modal opening)
  const handleActivateDeactivate = async (id, makeActive) => {
    const endpoint = makeActive ? `/api/users/${id}/activate` : `/api/users/${id}/deactivate`;

    const { response, data } = await authFetch(endpoint, { method: "PATCH" });

    if (!response.ok || data?.error) {
      if (makeActive && data?.code === "LGA_REQUIRED") {
        setActionMessage(data?.message || "Cannot activate until LGA access is assigned.");
      } else {
        setActionMessage(data?.message || "Failed to update user state");
      }
      return;
    }

    setActionMessage(`User ${makeActive ? "activated" : "deactivated"}`);
    loadUsers();
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    const { response, data } = await authFetch(`/api/users/${id}`, { method: "DELETE" });
    if (!response.ok || data?.error) {
      setActionMessage(data?.message || "Failed to delete user");
      return;
    }

    setActionMessage("User deleted");
    loadUsers();
  };

  // EDIT USER
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ full_name: user.full_name || "", role: user.role || "user" });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    const { response, data } = await authFetch(`/api/users/${editingUser.id}/update`, {
      method: "PATCH",
      body: JSON.stringify(editForm),
    });

      if (!response.ok || data?.error) {
        setActionMessage(
          data?.message || data?.error || "Failed to update user"
        );
          return;
      }

    setActionMessage("User updated successfully");
    setShowEditModal(false);
    loadUsers();
  };

  // PASSWORD RESET
  const openPasswordModal = (user) => {
    setPwUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setShowPwModal(true);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) return setPwError("Password must be 8 characters minimum");
    if (newPassword !== confirmPassword) return setPwError("Passwords do not match");

    const { response, data } = await authFetch(`/api/users/${pwUser.id}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword }),
    });

    if (!response.ok || data?.error) {
      setPwError(data?.message || "Failed to update password");
      return;
    }

    setActionMessage(`Password updated for ${pwUser.email}`);
    setShowPwModal(false);
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">User Administration</h1>

      <div className="btn-group mb-3">
        <button className={`btn btn-outline-primary ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>
          Active
        </button>
        <button className={`btn btn-outline-primary ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>
          Pending
        </button>
        <button className={`btn btn-outline-primary ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All
        </button>
      </div>

      {loading && <p>Loading users…</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {actionMessage && <div className="alert alert-info">{actionMessage}</div>}

      {!loading && !error && users.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle">
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
                    <td>
                      <span className={getRoleBadgeClass(u.role)}>
                        {u.role || "unknown"}
                      </span>
                    </td>
                    <td>
                      {active ? (
                        <span className="badge bg-success">Active</span>
                      ) : (
                        <span className="badge bg-secondary">Pending</span>
                      )}
                    </td>
                    <td className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </button>
                      {active ? (
                        <button
                          className="btn btn-sm btn-warning"
                          type="button"
                          onClick={() =>
                            handleActivateDeactivate(u.id, false)
                          }
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-success"
                          type="button"
                          onClick={() =>
                            handleActivateDeactivate(u.id, true)
                          }
                        >
                          Activate
                        </button>
                      )}
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
        initialLgas={userLgas}
        onSave={saveLgaAccess}
      />
    </div>
  );
};

export default UserAdmin;
