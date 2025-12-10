// client/src/Pages/admin/AssignLgaModal.jsx
import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const AssignLgaModal = ({
  show,
  onHide,
  user,
  allLgas,
  initialScope = "all",
  initialLgas = [],
  onSave,
}) => {
  const [scope, setScope] = useState(initialScope);
  const [selectedLgas, setSelectedLgas] = useState(initialLgas);

  useEffect(() => {
    setScope(initialScope);
    setSelectedLgas(initialLgas);
  }, [initialScope, initialLgas, user]);

  const handleToggleLga = (name) => {
    setSelectedLgas((prev) =>
      prev.includes(name)
        ? prev.filter((l) => l !== name)
        : [...prev, name]
    );
  };

  const handleSave = () => {
    if (scope === "restricted" && selectedLgas.length === 0) {
      alert("Please select at least one LGA or choose 'All LGAs'.");
      return;
    }

    onSave({
      scope,
      lgas: scope === "all" ? [] : selectedLgas,
    });
  };

  if (!user) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Assign LGAs for {user.full_name || user.email}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group as={Row} className="mb-3">
            <Form.Label as="legend" column sm={3}>
              Access type
            </Form.Label>
            <Col sm={9}>
              <Form.Check
                type="radio"
                id="scope-all"
                name="scope"
                label="All LGAs (full access)"
                checked={scope === "all"}
                onChange={() => setScope("all")}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                id="scope-restricted"
                name="scope"
                label="Specific LGAs only"
                checked={scope === "restricted"}
                onChange={() => setScope("restricted")}
              />
            </Col>
          </Form.Group>

          {scope === "restricted" && (
            <Form.Group>
              <Form.Label>Select LGAs</Form.Label>
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  border: "1px solid #dee2e6",
                  borderRadius: "0.25rem",
                  padding: "0.5rem 1rem",
                }}
              >
                {allLgas.length === 0 && (
                  <div className="text-muted small">
                    No LGAs found in dataset.
                  </div>
                )}
                {allLgas.map((lga) => (
                  <Form.Check
                    key={lga}
                    type="checkbox"
                    id={`lga-${lga}`}
                    label={lga}
                    checked={selectedLgas.includes(lga)}
                    onChange={() => handleToggleLga(lga)}
                    className="mb-1"
                  />
                ))}
              </div>
              <div className="mt-2 small text-muted">
                Tip: you can assign multiple LGAs – this user will see
                dashboards only for the selected areas.
              </div>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save LGA access
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignLgaModal;
