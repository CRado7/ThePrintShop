import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Table, Badge } from "react-bootstrap";

import { useQuoteStore } from "../store/quoteStore.js";
import { getQuoteTotals } from "../utils/quoteMath.js";
import { toMoney } from "../utils/money.js";
import { exportQuotePdf } from "../utils/exportQuotePDF.jsx";

export default function QuotesPage() {
  const navigate = useNavigate();

  // Pull everything from store including latest responses
  const quotes = useQuoteStore((s) => s.quotes);
  const createQuote = useQuoteStore((s) => s.createQuote);
  const deleteQuote = useQuoteStore((s) => s.deleteQuote);

  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpanded = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h3 className="mb-1">Quotes</h3>
          <div className="text-muted" style={{ fontSize: 13 }}>
            Saved to your browser (local storage)
          </div>
        </div>

        <Button
          onClick={() => {
            const id = createQuote({ name: "New Quote", status: "draft" });
            navigate(`/quote/${id}`);
          }}
        >
          + New Quote
        </Button>
      </div>

      <Card>
        <Card.Body>
          {quotes.length ? (
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Customer</th>
                  <th className="text-end">Units</th>
                  <th className="text-end">Total</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => {
                  const totals = getQuoteTotals(q.lineItems || []);
                  const isExpanded = expandedIds.includes(q.id);

                  // Latest response for displaying rejection notes
                  const latestResponse = q.responses?.[q.responses.length - 1];

                  // Badge color based on current quote.status
                  const statusColor =
                    q.status === "approved"
                      ? "success"
                      : q.status === "rejected"
                      ? "danger"
                      : q.status === "pending"
                      ? "warning"
                      : "primary";

                  return (
                    <React.Fragment key={q.id}>
                      {/* Main quote row */}
                      <tr>
                        <td className="fw-semibold">{q.name}</td>
                        <td>{q.customer?.name || "—"}</td>
                        <td className="text-end">{totals.totalQty}</td>
                        <td className="text-end">{toMoney(totals.sellTotal)}</td>
                        <td>
                          <Badge
                            bg={statusColor}
                            pill
                            style={{
                              cursor: q.responses?.length ? "pointer" : "default",
                            }}
                            onClick={() =>
                              q.responses?.length ? toggleExpanded(q.id) : null
                            }
                          >
                            {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                          </Badge>

                          {/* Latest rejection notes */}
                          {latestResponse?.status === "rejected" &&
                            latestResponse.notes && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#d9534f",
                                  marginTop: 2,
                                  borderTop: "1px solid #eee",
                                  paddingTop: 2,
                                }}
                              >
                                {latestResponse.notes}
                              </div>
                            )}
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => navigate(`/quote/${q.id}`)}
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => exportQuotePdf(q)}
                            >
                              PDF
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => deleteQuote(q.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Response history row */}
                      {q.responses?.length > 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: 0 }}>
                            <div
                              style={{
                                background: "#f8f9fa",
                                padding: "8px 12px",
                                fontSize: 13,
                                color: "#555",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  cursor: "pointer",
                                }}
                                onClick={() => toggleExpanded(q.id)}
                              >
                                <strong>Response History ({q.responses.length})</strong>
                                <span style={{ fontSize: 12, color: "#666" }}>
                                  {isExpanded ? "▲" : "▼"}
                                </span>
                              </div>

                              {isExpanded &&
                                q.responses.map((r, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginTop: 6,
                                      paddingBottom: 4,
                                      borderBottom:
                                        i < q.responses.length - 1
                                          ? "1px solid #ddd"
                                          : "none",
                                    }}
                                  >
                                    <div>
                                      <Badge
                                        bg={
                                          r.status === "approved"
                                            ? "success"
                                            : r.status === "rejected"
                                            ? "danger"
                                            : r.status === "pending"
                                            ? "warning"
                                            : "primary"
                                        }
                                        pill
                                        className="me-2"
                                      >
                                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                      </Badge>
                                      <small className="text-muted">
                                        {new Date(r.date).toLocaleString()}
                                      </small>
                                    </div>

                                    {/* Notes for rejected responses */}
                                    {r.status === "rejected" && r.notes && (
                                      <div style={{ color: "#d9534f", fontSize: 13 }}>
                                        {r.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-muted">No quotes saved yet. Click “New Quote”.</div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
