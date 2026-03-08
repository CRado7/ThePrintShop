import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Form, Row, Badge } from "react-bootstrap";

import { useQuoteStore } from "../store/quoteStore.js";
import QuoteLineItem from "../components/QuoteLineItem.jsx";
import SendQuoteModal from "../components/SendQuoteModal.jsx";
import { getQuoteTotalsAdjusted } from "../utils/quotePricing.js";
import { toMoney } from "../utils/money.js";
import { exportQuotePdf } from "../utils/exportQuotePDF.jsx";

export default function QuoteEditorPage() {
  const [showSendModal, setShowSendModal] = useState(false);

  const { quoteId } = useParams();
  const navigate = useNavigate();

  const quotes = useQuoteStore((s) => s.quotes);
  const updateQuote = useQuoteStore((s) => s.updateQuote);
  const deleteQuote = useQuoteStore((s) => s.deleteQuote);

  const quote = quotes.find((q) => q.id === quoteId);
  const totals = useMemo(
    () => getQuoteTotalsAdjusted(quote?.lineItems || []),
    [quote]
  );

  if (!quote) {
    return (
      <div className="container py-4">
        <h4>Quote not found</h4>
        <Button variant="outline-primary" onClick={() => navigate("/quotes")}>
          Back to Quotes
        </Button>
      </div>
    );
  }

  // Determine status color
  const statusColor =
    quote.status === "approved"
      ? "success"
      : quote.status === "rejected"
      ? "danger"
      : quote.status === "pending"
      ? "warning"
      : "primary";

  return (
    <div className="container py-4">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <h3 className="mb-1">
            {quote.name}{" "}
            <Badge bg={statusColor} pill style={{ fontSize: "0.8rem" }}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Badge>
          </h3>
          <div className="text-muted" style={{ fontSize: 13 }}>
            {quote.lineItems.length} items • {totals.totalQty} units
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate("/quotes")}>
            ← Quotes
          </Button>

          <Button
            variant="outline-danger"
            onClick={() => {
              deleteQuote(quote.id);
              navigate("/quotes");
            }}
          >
            Delete Quote
          </Button>
        </div>
      </div>

      <Row className="g-3">
        <Col
          lg={4}
          style={{ position: "sticky", top: "20px", alignSelf: "start" }}
        >
          <Card>
            <Card.Body>
              <Form.Label>Quote Name</Form.Label>
              <Form.Control
                value={quote.name}
                onChange={(e) =>
                  updateQuote(quote.id, { name: e.target.value })
                }
              />

              <hr />

              <div className="fw-semibold mb-2">Customer</div>

              <Form.Label>Name</Form.Label>
              <Form.Control
                value={quote.customer?.name || ""}
                onChange={(e) =>
                  updateQuote(quote.id, {
                    customer: { ...quote.customer, name: e.target.value },
                  })
                }
              />

              <Form.Label className="mt-2">Company</Form.Label>
              <Form.Control
                value={quote.customer?.company || ""}
                onChange={(e) =>
                  updateQuote(quote.id, {
                    customer: { ...quote.customer, company: e.target.value },
                  })
                }
              />

              <Form.Label className="mt-2">Email</Form.Label>
              <Form.Control
                value={quote.customer?.email || ""}
                onChange={(e) =>
                  updateQuote(quote.id, {
                    customer: { ...quote.customer, email: e.target.value },
                  })
                }
              />

              <Form.Label className="mt-2">Phone</Form.Label>
              <Form.Control
                value={quote.customer?.phone || ""}
                onChange={(e) =>
                  updateQuote(quote.id, {
                    customer: { ...quote.customer, phone: e.target.value },
                  })
                }
              />

              <Form.Label className="mt-3">Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={quote.notes || ""}
                onChange={(e) =>
                  updateQuote(quote.id, { notes: e.target.value })
                }
              />

              <hr />

              <div className="fw-semibold">Totals</div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                Total units: {totals.totalQty}
              </div>
              <div className="fw-bold" style={{ fontSize: 22 }}>
                {toMoney(totals.sellTotal)}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                Internal profit: {toMoney(totals.profit)}
              </div>

              <hr />

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  onClick={() => exportQuotePdf(quote)}
                  disabled={quote.lineItems.length === 0}
                >
                  Export As PDF
                </Button>

                <Button
                  variant="outline-primary"
                  onClick={() => setShowSendModal(true)}
                  disabled={quote.lineItems.length === 0}
                >
                  Send Email
                </Button>

                <SendQuoteModal
                  show={showSendModal}
                  onHide={() => setShowSendModal(false)}
                  quote={quote}
                  onSend={async ({ toEmail, subject, message }) => {
                    const res = await fetch(
                      `http://localhost:5050/api/quote/${quote.id}/send-email`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ quote, toEmail, subject, message }),
                      }
                    );
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to send email");

                    // ✅ Only update status to pending on send
                    updateQuote(quote.id, {
                      status: "pending",
                      shareToken: data.token,
                    });

                    return data;
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <div className="d-flex flex-column gap-3">
            {quote.lineItems.map((li) => (
              <QuoteLineItem key={li.id} quoteId={quote.id} lineItem={li} />
            ))}

            {!quote.lineItems.length && (
              <div className="text-muted">No line items yet. Go add products.</div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
