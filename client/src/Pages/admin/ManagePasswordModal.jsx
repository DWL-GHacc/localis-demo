// client/src/Pages/admin/ManagePasswordModal.jsx
import { Modal } from "react-bootstrap";

const ManagePasswordModal = ({
  show,
  onHide,
  user,
  form,
  onChange,
  onSubmit,
  onDeletePassword,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>
        Manage Password{user ? ` – ${user.email}` : ""}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {user && (
        <>
          {form.error && (
            <div className="alert alert-danger py-2">{form.error}</div>
          )}
          {form.message && (
            <div className="alert alert-success py-2">{form.message}</div>
          )}

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                className="form-control"
                value={form.newPassword}
                onChange={onChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                value={form.confirmPassword}
                onChange={onChange}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={onDeletePassword}
              >
                Delete / Clear Password
              </button>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onHide}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={form.loading}
                >
                  {form.loading ? "Saving…" : "Save new password"}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </Modal.Body>
  </Modal>
);

export default ManagePasswordModal;
