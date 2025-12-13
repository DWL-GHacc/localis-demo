import { useState, useEffect } from "react";
import { authFetch } from "../../API/authClient";

const FEEDBACK_TYPES = [
  { value: "all", label: "All types" },
  { value: "bug", label: "Bug – Something is broken" },
  { value: "feature_request", label: "Feature request" },
  { value: "data_issue", label: "Data issue" },
  { value: "ui_ux", label: "UI / UX" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

const FeedbackAdmin = () => {
  const [feedback, setFeedback] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);

      const { response, data } = await authFetch("/api/feedback/all");

      if (!response.ok || data?.error) {
        throw new Error(
          data?.message || data?.error || "Failed to load feedback"
        );
      }

      setFeedback(Array.isArray(data.feedback) ? data.feedback : []);
    } catch (err) {
      console.error("Error loading feedback:", err);
      setError(err.message || "Failed to load feedback");
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const filteredFeedback =
    filterType === "all"
      ? feedback
      : feedback.filter((f) => f.feedback_type === filterType);

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Feedback Administration</h1>

      <p className="text-muted mb-3">
        Review feedback submitted by users. Use the filter to focus on specific
        types.
      </p>

      {/* Filter controls */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <span className="me-2 fw-semibold">Filter by type:</span>

        <div className="btn-group">
          {FEEDBACK_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`btn btn-outline-primary ${
                filterType === t.value ? "active" : ""
              }`}
              onClick={() => setFilterType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm ms-auto"
          onClick={loadFeedback}
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading feedback…</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {infoMessage && <div className="alert alert-info">{infoMessage}</div>}

      {!loading && !error && filteredFeedback.length === 0 && (
        <p className="text-muted">No feedback found for this filter.</p>
      )}

      {!loading && !error && filteredFeedback.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th style={{ whiteSpace: "nowrap" }}>Date / Time</th>
                <th>Type</th>
                <th>User</th>
                <th>Email</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedback.map((f) => (
                <tr key={f.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(f.created_at)}
                  </td>
                  <td>
                    <span className="badge bg-secondary text-uppercase">
                      {f.feedback_type}
                    </span>
                  </td>
                  <td>{f.user_name}</td>
                  <td>{f.user_email}</td>
                  <td style={{ maxWidth: "450px", whiteSpace: "pre-wrap" }}>
                    {f.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackAdmin;
