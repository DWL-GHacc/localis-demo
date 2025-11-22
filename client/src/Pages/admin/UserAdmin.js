// client/src/Pages/admin/UserAdmin.jsx
import { useEffect, useState } from "react";
import { authFetch } from "../../api/authClient";
import EditUserModal from "./EditUserModal";

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

  const extractUsers = (data) =>
    data && Array.isArray(data.users) ? data.users : [];

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
