import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AssignLgaModal = ({ show, onHide, user, allLgas, initialLgas = [], onSave }) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(Array.isArray(initialLgas) ? initialLgas : []);
  }, [initialLgas, user]);

  const allSorted = useMemo(() => (Array.isArray(allLgas) ? [...allLgas] : []), [allLgas]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const allChecked = allSorted.length > 0 && selected.length === allSorted.length;
  const noneChecked = selected.length === 0;

  const toggleOne = (lga) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(lga)) s.delete(lga);
      else s.add(lga);
      return Array.from(s);
    });
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.length === allSorted.length ? [] : allSorted));
  };

  const handleSave = () => {
    // allow empty, but activation will be blocked until at least 1 is selected
    onSave({ lgas: selected });
  };

  if (!user) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign LGAs for {user.full_name || user.email}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="text-muted small">
            Selected: <strong>{selected.length}</strong> / {allSorted.length}
          </div>

          <Button
            variant={allChecked ? "outline-secondary" : "outline-primary"}
            size="sm"
            onClick={toggleAll}
            disabled={allSorted.length === 0}
          >
            {allChecked ? "Clear all" : "Select all"}
          </Button>
        </div>

        <div
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            border: "1px solid #dee2e6",
            borderRadius: "0.25rem",
            padding: "0.75rem 1rem",
          }}
        >
          {allSorted.length === 0 && (
            <div className="text-muted small">No LGAs found in dataset.</div>
          )}

          {allSorted.map((lga) => (
            <Form.Check
              key={lga}
              type="checkbox"
              id={`lga-${lga}`}
              label={lga}
              checked={selectedSet.has(lga)}
              onChange={() => toggleOne(lga)}
              className="mb-1"
            />
          ))}
        </div>

        {noneChecked && (
          <div className="mt-2 small text-warning">
            No LGAs selected. This user cannot be activated until at least one LGA is assigned.
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={allSorted.length === 0}>
          Update LGA access
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignLgaModal;
