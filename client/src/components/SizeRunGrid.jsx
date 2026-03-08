import { Table, Form } from "react-bootstrap";

export default function SizeRunGrid({ sizes, value, onChange }) {
  const list = Array.isArray(sizes) ? sizes : [];
  const sizeQty = value || {};

  function setSize(size, qty) {
    const next = { ...sizeQty, [size]: qty };

    // Clean zeros
    if (!next[size] || Number(next[size]) === 0) {
      delete next[size];
    }

    onChange?.(next);
  }

  return (
    <Table bordered size="sm" className="mb-0">
      <thead>
        <tr>
          <th>Size</th>
          <th style={{ width: 160 }}>Qty</th>
        </tr>
      </thead>
      <tbody>
        {list.map((s) => (
          <tr key={s}>
            <td className="fw-semibold">{s}</td>
            <td>
              <Form.Control
                type="number"
                min="0"
                value={sizeQty[s] ?? ""}
                onChange={(e) => setSize(s, e.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}