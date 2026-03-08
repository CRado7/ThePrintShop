import { Button, Col, Form, Row, Table } from "react-bootstrap";

function uid() {
  return Math.random().toString(16).slice(2);
}

export default function AdjustersEditor({ adjusters, onChange }) {
  const list = Array.isArray(adjusters) ? adjusters : [];

  function addAdjuster() {
    const next = [
      ...list,
      {
        id: `adj_${uid()}`,
        name: "",
        type: "perItem",
        amount: 0
      }
    ];
    onChange?.(next);
  }

  function removeAdjuster(id) {
    onChange?.(list.filter((a) => a.id !== id));
  }

  function patchAdjuster(id, patch) {
    onChange?.(list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold">Adjusters</div>
        <Button size="sm" variant="outline-primary" onClick={addAdjuster}>
          Add
        </Button>
      </div>

      {list.length ? (
        <Table bordered size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: 130 }}>Type</th>
              <th style={{ width: 140 }} className="text-end">
                Amount
              </th>
              <th style={{ width: 90 }}></th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>
                  <Form.Control
                    value={a.name}
                    onChange={(e) => patchAdjuster(a.id, { name: e.target.value })}
                    placeholder="Ex: Screen print"
                  />
                </td>
                <td>
                  <Form.Select
                    value={a.type}
                    onChange={(e) => patchAdjuster(a.id, { type: e.target.value })}
                  >
                    <option value="perItem">Per Item</option>
                    <option value="flat">Flat</option>
                  </Form.Select>
                </td>
                <td>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={a.amount}
                    onChange={(e) => patchAdjuster(a.id, { amount: Number(e.target.value || 0) })}
                  />
                </td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => removeAdjuster(a.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="text-muted" style={{ fontSize: 13 }}>
          No adjusters yet.
        </div>
      )}
    </div>
  );
}