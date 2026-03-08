import { useMemo, useState } from "react";
import { Button, Card, Col, Form, Row, Table, Image } from "react-bootstrap";

import { useQuoteStore } from "../store/quoteStore.js";
import { toMoney } from "../utils/money.js";

import AdjustersEditor from "./AdjustersEditor.jsx";

// ✅ shared math (same used by PDF + Quote totals)
import { getLineItemTotalsAdjusted } from "../utils/quotePricing.js";

export default function QuoteLineItem({ quoteId, lineItem }) {
  const removeLineItem = useQuoteStore((s) => s.removeLineItem);
  const updateLineItem = useQuoteStore((s) => s.updateLineItem);

  // --- Edit state ---
  const [isEditing, setIsEditing] = useState(false);
  const [draftSizeQty, setDraftSizeQty] = useState({ ...lineItem.sizeQty });
  const [draftMarkup, setDraftMarkup] = useState(lineItem.markupPerItem ?? 0);
  const [draftMarkupType, setDraftMarkupType] = useState(
    lineItem.markupType || "dollar"
  );

  const [newSize, setNewSize] = useState("");
  const [newQty, setNewQty] = useState(0);

  const availableSizes = lineItem.availableSizes || [];
  const skuMeta = lineItem.skuMetaBySize || {};

  // --- Handlers ---
  function handleQtyChange(size, value) {
    setDraftSizeQty((prev) => ({ ...prev, [size]: Number(value || 0) }));
  }

  function handleAddSize() {
    const size = newSize.trim().toUpperCase();
    const qty = Number(newQty);

    if (!size) return alert("Please enter a size.");
    if (!availableSizes.includes(size))
      return alert("This size is not available for this product.");
    if (draftSizeQty[size]) return alert("Size already added.");
    if (qty <= 0) return alert("Quantity must be greater than zero.");

    setDraftSizeQty((prev) => ({ ...prev, [size]: qty }));
    setNewSize("");
    setNewQty(0);
  }

  function handleSave() {
    const updatedCostBySize = { ...(lineItem.costBySize || {}) };
    const updatedSkuBySize = { ...(lineItem.skuBySize || {}) };
    const updatedGtinBySize = { ...(lineItem.gtinBySize || {}) };

    Object.keys(draftSizeQty).forEach((size) => {
      if (!updatedCostBySize[size] && skuMeta[size]) {
        updatedCostBySize[size] = skuMeta[size].unitCost || 0;
        updatedSkuBySize[size] = skuMeta[size].sku || "";
        updatedGtinBySize[size] = skuMeta[size].gtin || "";
      }
    });

    updateLineItem(quoteId, lineItem.id, {
      sizeQty: draftSizeQty,
      markupPerItem: draftMarkup,
      markupType: draftMarkupType,
      costBySize: updatedCostBySize,
      skuBySize: updatedSkuBySize,
      gtinBySize: updatedGtinBySize,
    });

    setIsEditing(false);
  }

  function handleCancel() {
    setDraftSizeQty({ ...lineItem.sizeQty });
    setDraftMarkup(lineItem.markupPerItem ?? 0);
    setDraftMarkupType(lineItem.markupType || "dollar");
    setIsEditing(false);
    setNewSize("");
    setNewQty(0);
  }

  // --- Dynamic line item (while editing) ---
  const dynamicLineItem = useMemo(() => {
    // Build a temporary lineItem using draft edits
    const costBySize = { ...(lineItem.costBySize || {}) };

    // fill missing costs from skuMeta
    Object.keys(draftSizeQty).forEach((size) => {
      if (!costBySize[size] && skuMeta[size]) {
        costBySize[size] = skuMeta[size].unitCost || 0;
      }
    });

    return {
      ...lineItem,
      sizeQty: draftSizeQty,
      markupPerItem: draftMarkup,
      markupType: draftMarkupType,
      costBySize,
    };
  }, [lineItem, draftSizeQty, draftMarkup, draftMarkupType, skuMeta]);

  const dynamicTotals = useMemo(() => {
    return getLineItemTotalsAdjusted(dynamicLineItem);
  }, [dynamicLineItem]);

  // --- Sorted sizes for display ---
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const sortedSizes = Object.keys(draftSizeQty).sort(
    (a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)
  );

  return (
    <Card className="mb-3">
      <Card.Body>
        {/* --- Image + Title --- */}
        <div className="d-flex align-items-start gap-3">
          {lineItem.image && (
            <Image
              src={lineItem.image}
              alt={lineItem.title}
              width={80}
              height={80}
              style={{ objectFit: "contain" }}
              rounded
            />
          )}

          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-semibold">{lineItem.title}</div>

                <div className="text-muted" style={{ fontSize: 13 }}>
                  {lineItem.brand ? `${lineItem.brand} • ` : ""}
                  {lineItem.styleNumber} • {lineItem.color}
                </div>

                <div className="text-muted" style={{ fontSize: 12 }}>
                  SKU: {lineItem.sku || "—"} • GTIN: {lineItem.gtin || "—"}
                </div>
              </div>

              <div className="d-flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button variant="success" size="sm" onClick={handleSave}>
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                )}

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeLineItem(quoteId, lineItem.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Markup Editor --- */}
        <Row className="g-3 pt-3">
          <Col md={12}>
            <Form.Label>Markup per item</Form.Label>

            <div className="d-flex gap-2 mb-3 align-items-center">
              <Form.Select
                value={draftMarkupType}
                onChange={(e) => setDraftMarkupType(e.target.value)}
                style={{ maxWidth: 100 }}
                disabled={!isEditing}
              >
                <option value="dollar">Dollar</option>
                <option value="percent">Percent</option>
              </Form.Select>

              <Form.Control
                type="number"
                step={draftMarkupType === "dollar" ? 0.01 : 1}
                value={draftMarkup}
                onChange={(e) => setDraftMarkup(Number(e.target.value || 0))}
                disabled={!isEditing}
              />

              <span>{draftMarkupType === "percent" ? "%" : "$"}</span>

              {/* --- Totals --- */}
              <div className="ms-auto text-end">
                <div className="fw-semibold">Line Total</div>

                <div style={{ fontSize: 20 }} className="fw-bold">
                  {toMoney(dynamicTotals.sellTotal)}
                </div>

                <div className="text-muted" style={{ fontSize: 13 }}>
                  Cost / item:{" "}
                  {toMoney(
                    dynamicTotals.qtyTotal
                      ? dynamicTotals.costTotal / dynamicTotals.qtyTotal
                      : 0
                  )}
                  {" • "}
                  Sell / item: {toMoney(dynamicTotals.unitSellAvg)}
                </div>

                <div className="text-muted" style={{ fontSize: 13 }}>
                  Internal profit: {toMoney(dynamicTotals.profit)}
                </div>
              </div>
            </div>
          </Col>

          {/* --- Editable Sizes --- */}
          <Col md={12}>
            <div className="fw-semibold mb-2">Sizes</div>

            <Table bordered size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>Size</th>
                  <th className="text-end">Qty</th>
                  <th className="text-end">Cost</th>
                </tr>
              </thead>

              <tbody>
                {sortedSizes.map((s) => (
                  <tr key={s}>
                    <td>{s}</td>

                    <td className="text-end">
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          min={0}
                          value={draftSizeQty[s]}
                          onChange={(e) => handleQtyChange(s, e.target.value)}
                          style={{ width: 80, marginLeft: "auto" }}
                        />
                      ) : (
                        draftSizeQty[s]
                      )}
                    </td>

                    <td className="text-end">
                      {toMoney(
                        (dynamicLineItem.costBySize || {})[s] ||
                          skuMeta[s]?.unitCost ||
                          0
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {isEditing && (
              <div className="d-flex gap-2 mt-2 align-items-center flex-wrap">
                <Form.Select
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  style={{ maxWidth: 200 }}
                >
                  <option value="">Add a size...</option>

                  {availableSizes
                    .filter((s) => !draftSizeQty[s])
                    .map((s) => (
                      <option key={s} value={s}>
                        {s} • {toMoney(skuMeta[s]?.unitCost || 0)}
                      </option>
                    ))}
                </Form.Select>

                <Form.Control
                  type="number"
                  min={0}
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  style={{ maxWidth: 80 }}
                />

                <Button
                  variant="success"
                  size="sm"
                  onClick={handleAddSize}
                >
                  Add Size
                </Button>
              </div>
            )}
          </Col>

          {/* --- Adjusters --- */}
          <Col md={12} className="pt-3">
            <AdjustersEditor
              adjusters={lineItem.adjusters || []}
              onChange={(adjusters) =>
                updateLineItem(quoteId, lineItem.id, { adjusters })
              }
            />

            {(lineItem.adjusters || []).length > 0 && (
              <div className="text-muted mt-2" style={{ fontSize: 13 }}>
                Per-item adjusters: {toMoney(dynamicTotals.perItemAdjusters)} •
                Flat adjusters: {toMoney(dynamicTotals.flatAdjusters)}
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
