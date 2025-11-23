// client/src/Pages/admin/EditUserModal.jsx
import { Modal } from "react-bootstrap";

const EditUserModal = ({
  show,
  onHide,
  editingUser,
  editForm,
  onChange,
  onSubmit,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Edit User</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {editingUser && (
        <form onSubmit={onSubmit}>
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
              onChange={onChange}
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
              onChange={onChange}
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
              onClick={onHide}
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
);

export default EditUserModal;
