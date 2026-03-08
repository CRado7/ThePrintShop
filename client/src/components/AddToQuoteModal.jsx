import { useState, useMemo } from "react";
import { Modal, Button, Form, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useQuoteStore } from "../store/quoteStore.js";

export default function AddToQuoteModal({ show, onHide, lineItemDraft }) {
  const navigate = useNavigate();
  const createQuote = useQuoteStore((s) => s.createQuote);
  const addLineItemToQuote = useQuoteStore((s) => s.addLineItemToQuote);
  const quotes = useQuoteStore((s) => s.quotes || []);

  const [mode, setMode] = useState("new"); // "new" or "existing"
  const [selectedQuoteId, setSelectedQuoteId] = useState("");

  const hasSizeQty = useMemo(() => {
    return Object.keys(lineItemDraft?.sizeQty || {}).length > 0;
  }, [lineItemDraft]);

  // --- Create New Quote Handler ---
  function handleCreateNewQuote() {
    if (!hasSizeQty) {
      alert("Please enter quantities before creating a quote.");
      return;
    }

    if (quotes.length >= 3) {
      alert(
        "You have reached the maximum of 3 quotes. Please delete an existing quote first."
      );
      return;
    }

    const newQuoteId = createQuote();
    if (!newQuoteId) return;

    addLineItemToQuote(newQuoteId, lineItemDraft);
    onHide();
    navigate(`/quote/${newQuoteId}`, { state: { initialItems: [lineItemDraft] } });
  }

  // --- Add to Existing Quote Handler ---
  function handleAddToExistingQuote() {
    if (!selectedQuoteId || !hasSizeQty) return;

    addLineItemToQuote(selectedQuoteId, lineItemDraft);
    onHide();
    navigate(`/quote/${selectedQuoteId}`);
  }

  // Enable Add button only for existing quote with a selected quote
  const canAdd = mode === "existing" && selectedQuoteId && hasSizeQty;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add to Quote</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!hasSizeQty && (
          <div className="text-danger mb-3">
            Please enter quantities before adding to quote.
          </div>
        )}

        {/* --- Item Thumbnail --- */}
        {lineItemDraft?.image && (
          <div className="text-center mb-3">
            <Image
              src={lineItemDraft.image}
              alt={lineItemDraft.title}
              width={100}
              height={100}
              style={{ objectFit: "contain" }}
              rounded
            />
          </div>
        )}

        {/* --- Mode Buttons --- */}
        <div className="d-flex gap-2 mb-3">
          <Button
            variant={mode === "new" ? "primary" : "outline-secondary"}
            onClick={() => setMode("new")}
          >
            Create New Quote
          </Button>
          <Button
            variant={mode === "existing" ? "primary" : "outline-secondary"}
            onClick={() => setMode("existing")}
          >
            Add to Existing Quote
          </Button>
        </div>

        {/* --- Existing Quotes Dropdown --- */}
        {mode === "existing" && (
          <div>
            {quotes.length === 0 ? (
              <div className="text-muted small">No existing quotes found.</div>
            ) : (
              <Form.Select
                value={selectedQuoteId}
                onChange={(e) => setSelectedQuoteId(e.target.value)}
              >
                <option value="">Select a quote...</option>
                {quotes.map((q, i) => (
                  <option key={q.id || i} value={q.id}>
                    {q.name} • {q.lineItems?.length || 0} items
                  </option>
                ))}
              </Form.Select>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>

        {mode === "new" ? (
          <Button
            variant="success"
            onClick={handleCreateNewQuote}
            disabled={!hasSizeQty}
          >
            Create Quote
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={handleAddToExistingQuote}
            disabled={!canAdd}
          >
            Add
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
