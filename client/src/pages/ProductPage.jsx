// src/pages/ProductPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGetProductsByStyle } from "../api/catalogApi";
import { useQuoteStore } from "../store/quoteStore.js";
import AddToQuoteModal from "../components/AddToQuoteModal"; // adjust path if needed

export default function ProductPage() {
  const { productId } = useParams(); // <-- styleID
  const addLineItem = useQuoteStore((s) => s.addLineItem);

  // -----------------------------
  // State
  // -----------------------------
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const [selectedColorCode, setSelectedColorCode] = useState("");
  const [sizeQtyDraft, setSizeQtyDraft] = useState({});

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [pendingQuoteItem, setPendingQuoteItem] = useState(null);


  // -----------------------------
  // Fetch products by style
  // -----------------------------
  useEffect(() => {
    if (!productId) return;

    (async () => {
      try {
        setError("");
        setLoading(true);
        const data = await apiGetProductsByStyle(productId);
        const list = Array.isArray(data) ? data : [];
        setProducts(list);

        if (list.length) {
          const first = list[0];
          const firstColorCode = first?.raw?.colorCode || "";
          setSelectedColorCode(firstColorCode);
        }
      } catch (err) {
        setError(err?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // Reset qty draft when switching colors
  useEffect(() => setSizeQtyDraft({}), [selectedColorCode]);

  // -----------------------------
  // Helpers
  // -----------------------------
  const safeNum = (n) => {
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
  };

  const fmtMoney = (n) => {
    if (n == null || Number.isNaN(Number(n))) return null;
    return `$${Number(n).toFixed(2)}`;
  };

  const imgUrl = (path) =>
    path ? `https://www.ssactivewear.com/${String(path).replace(/^\/+/, "")}` : null;

  // -----------------------------
  // Derived data
  // -----------------------------
  const colors = useMemo(() => {
    const map = new Map();
    for (const sku of products) {
      const raw = sku?.raw || {};
      const code = raw.colorCode || "";
      const name = raw.colorName || "";
      const swatch = raw.colorSwatchImage || "";
      if (!code) continue;
      if (!map.has(code)) {
        map.set(code, { colorCode: code, colorName: name, swatch });
      }
    }
    return Array.from(map.values());
  }, [products]);

  const skusForSelectedColor = useMemo(
    () => products.filter((p) => p?.raw?.colorCode === selectedColorCode),
    [products, selectedColorCode]
  );

  const selectedSku = useMemo(() => skusForSelectedColor[0] || null, [skusForSelectedColor]);

  const sizeColumns = useMemo(() => {
    const map = new Map();
    for (const sku of skusForSelectedColor) {
      const raw = sku?.raw || {};
      const sizeName = raw.sizeName;
      console.log("Processing SKU for size columns:", { sku, sizeName });
      if (!sizeName) continue;
      if (!map.has(sizeName)) map.set(sizeName, { sizeName, sizeOrder: raw.sizeOrder || raw.sizeCode || sizeName });
    }
    return Array.from(map.values())
      .sort((a, b) => String(a.sizeOrder).localeCompare(String(b.sizeOrder)))
      .map((x) => x.sizeName);
  }, [skusForSelectedColor]);

  const warehouseRows = useMemo(() => {
    const map = new Map();
    for (const sku of skusForSelectedColor) {
      const warehouses = sku?.raw?.warehouses || [];
      for (const w of warehouses) {
        const abbr = w?.warehouseAbbr;
        if (!abbr) continue;
        if (!map.has(abbr)) map.set(abbr, { warehouseAbbr: abbr, dropship: !!w.dropship });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.warehouseAbbr.localeCompare(b.warehouseAbbr));
  }, [skusForSelectedColor]);

  const skuMetaBySize = useMemo(() => {
    const map = {};
    for (const sku of skusForSelectedColor) {
      const raw = sku?.raw || {};
      const sizeName = raw.sizeName;
      if (!sizeName) continue;
      map[sizeName] = {
        sku: sku?.sku || sku?.identifier || raw.sku || "",
        gtin: sku?.gtin || raw.gtin || "",
        unitCost: raw.salePrice ?? raw.customerPrice ?? raw.piecePrice ?? sku?.salePrice ?? sku?.customerPrice ?? sku?.piecePrice ?? 0,
      };
    }
    return map;
  }, [skusForSelectedColor]);

  const stockTable = useMemo(() => {
    const table = {};
    for (const wh of warehouseRows) {
      table[wh.warehouseAbbr] = {};
      for (const size of sizeColumns) table[wh.warehouseAbbr][size] = 0;
    }
    for (const sku of skusForSelectedColor) {
      const size = sku?.raw?.sizeName;
      const warehouses = sku?.raw?.warehouses || [];
      if (!size) continue;
      for (const w of warehouses) {
        const abbr = w?.warehouseAbbr;
        const qty = safeNum(w?.qty || 0);
        if (!abbr) continue;
        if (!table[abbr]) table[abbr] = {};
        table[abbr][size] = qty;
      }
    }
    return table;
  }, [skusForSelectedColor, warehouseRows, sizeColumns]);

  const rowTotals = useMemo(() => {
    const totals = {};
    for (const wh of warehouseRows) {
      const abbr = wh.warehouseAbbr;
      totals[abbr] = sizeColumns.reduce((sum, size) => sum + safeNum(stockTable?.[abbr]?.[size] || 0), 0);
    }
    return totals;
  }, [warehouseRows, sizeColumns, stockTable]);

  const colTotals = useMemo(() => {
    const totals = {};
    for (const size of sizeColumns) {
      totals[size] = warehouseRows.reduce((sum, wh) => sum + safeNum(stockTable?.[wh.warehouseAbbr]?.[size] || 0), 0);
    }
    return totals;
  }, [warehouseRows, sizeColumns, stockTable]);

  const grandTotal = useMemo(() => sizeColumns.reduce((sum, size) => sum + safeNum(colTotals[size] || 0), 0), [sizeColumns, colTotals]);

  const totalDraftQty = useMemo(() => Object.values(sizeQtyDraft).reduce((sum, q) => sum + safeNum(q), 0), [sizeQtyDraft]);

  // -----------------------------
  // Display fields
  // -----------------------------
  const brandName = selectedSku?.brandName || "";
  const styleName = selectedSku?.styleName || "";
  const title = selectedSku?.title?.trim() || `${brandName} ${styleName}`.trim();
  const colorName = selectedSku?.raw?.colorName || "";

  const front = imgUrl(selectedSku?.raw?.colorFrontImage || selectedSku?.colorFrontImage || selectedSku?.displayImage);
  const side = imgUrl(selectedSku?.raw?.colorSideImage || selectedSku?.colorSideImage);
  const back = imgUrl(selectedSku?.raw?.colorBackImage || selectedSku?.colorBackImage);
  const swatch = imgUrl(selectedSku?.raw?.colorSwatchImage || selectedSku?.colorSwatchImage);
  const brandSlug = selectedSku?.brandID || "";

  function setQtyForSize(size, nextQty) {
    const qty = Math.max(0, Math.floor(Number(nextQty || 0)));
    setSizeQtyDraft((prev) => {
      const copy = { ...prev };
      if (!qty) delete copy[size];
      else copy[size] = qty;
      return copy;
    });
  }

  function handleAddToQuoteClick() {
    // Only proceed if at least one qty is selected
    const sizeQty = {};
    for (const [size, qty] of Object.entries(sizeQtyDraft)) {
      const q = safeNum(qty);
      if (q > 0) sizeQty[size] = q;
    }
  
    if (!Object.keys(sizeQty).length) {
      alert("Please enter at least one quantity before adding to quote.");
      return;
    }
  
    // --- Make sure skuMetaBySize is fully included ---
    // skuMetaBySize should be your product's full metadata object keyed by size
    // Example: { XS: { unitCost: 42.35, sku: "...", gtin: "..." }, S: {...}, ... }
    const fullSkuMetaBySize = skuMetaBySize || {};
  
    const lineItem = {
      supplier: "ss",
      title,
      brand: brandName,
      styleNumber: styleName,
      color: colorName,
      image: front,
      sizeQty, // only the selected quantities
      availableSizes: Object.keys(fullSkuMetaBySize), // all possible sizes
      skuMetaBySize: fullSkuMetaBySize, // full metadata so costs are available
      costBySize: Object.fromEntries(
        Object.keys(fullSkuMetaBySize).map((size) => [
          size,
          safeNum(fullSkuMetaBySize[size]?.unitCost),
        ])
      ),
      skuBySize: Object.fromEntries(
        Object.keys(fullSkuMetaBySize).map((size) => [
          size,
          fullSkuMetaBySize[size]?.sku || "",
        ])
      ),
      gtinBySize: Object.fromEntries(
        Object.keys(fullSkuMetaBySize).map((size) => [
          size,
          fullSkuMetaBySize[size]?.gtin || "",
        ])
      ),
      markupPerItem: 0,
      adjusters: [],
    };
  
    console.log("LINE ITEM prepared for modal:", lineItem);
  
    setPendingQuoteItem(lineItem);
    setShowQuoteModal(true);
  }
  
  

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="container my-4">
      {!loading && !error && products.length && selectedSku ? (
        <>
          <Link
            to={brandSlug ? `/brand/${brandSlug}` : "/"}
            className="btn btn-outline-secondary mb-3"
          >
            ← Back to {brandName || "Brand"} Products
          </Link>

          <div className="row">
            {/* Images & Colors */}
            <div className="col-md-6">
              {front ? (
                <img
                  src={front}
                  alt={title}
                  className="img-fluid mb-2"
                  style={{ background: "#f8f9fa", objectFit: "contain" }}
                />
              ) : (
                <div className="text-muted">(No image)</div>
              )}
              <div className="d-flex gap-2 flex-wrap mb-2">
                {front && <img src={front} className="img-thumbnail" width={80} alt="Front" />}
                {side && <img src={side} className="img-thumbnail" width={80} alt="Side" />}
                {back && <img src={back} className="img-thumbnail" width={80} alt="Back" />}
                {swatch && <img src={swatch} className="img-thumbnail" width={40} alt="Swatch" />}
              </div>

              <div className="mt-3">
                <h6>Available Colors:</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c.colorCode}
                      type="button"
                      className={`btn btn-sm ${
                        selectedColorCode === c.colorCode ? "btn-primary" : "btn-outline-secondary"
                      }`}
                      onClick={() => setSelectedColorCode(c.colorCode)}
                    >
                      {c.colorName || c.colorCode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stock Table + Add to Quote */}
            <div className="col-md-6">
              <h3 className="mb-2">{title}</h3>
              <div className="mb-3 small">
                <div><strong>Color:</strong> {colorName}</div>
                <div className="text-muted">Enter quantities by size, then click <strong>Add to Quote</strong>.</div>
              </div>

              {warehouseRows.length && sizeColumns.length ? (
                <div className="mb-3">
                  <h6 className="mb-2">Stock by Warehouse + Size</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th style={{ minWidth: 90 }}>WH</th>
                          {sizeColumns.map((s) => {
                            const price = skuMetaBySize[s]?.unitCost;
                            return (
                              <th key={s} className="text-center" style={{ minWidth: 110 }}>
                                <div className="fw-semibold">{s}</div>
                                <div className="small text-muted">{price != null ? fmtMoney(price) : "—"}</div>
                                <input
                                  className="form-control form-control-sm mt-1"
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={sizeQtyDraft[s] ?? ""}
                                  placeholder="Qty"
                                  onChange={(e) => setQtyForSize(s, e.target.value)}
                                />
                              </th>
                            );
                          })}
                          <th className="text-center" style={{ minWidth: 80 }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehouseRows.map((wh) => (
                          <tr key={wh.warehouseAbbr}>
                            <td className="fw-semibold">
                              {wh.warehouseAbbr}
                              {wh.dropship && <span className="badge bg-secondary ms-2">DS</span>}
                            </td>
                            {sizeColumns.map((size) => (
                              <td key={size} className="text-center">
                                {stockTable?.[wh.warehouseAbbr]?.[size] > 0 ? stockTable[wh.warehouseAbbr][size] : <span className="text-muted">—</span>}
                              </td>
                            ))}
                            <td className="text-center fw-semibold">
                              {rowTotals?.[wh.warehouseAbbr] > 0 ? rowTotals[wh.warehouseAbbr] : "—"}
                            </td>
                          </tr>
                        ))}
                        {/* Totals */}
                        <tr className="table-light">
                          <td className="fw-bold">Total</td>
                          {sizeColumns.map((size) => (
                            <td key={size} className="text-center fw-semibold">
                              {colTotals[size] > 0 ? colTotals[size] : "—"}
                            </td>
                          ))}
                          <td className="text-center fw-bold">{grandTotal > 0 ? grandTotal : "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Add to Quote */}
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <div className="text-muted small">Selected qty: <strong>{totalDraftQty}</strong></div>
                    <button
                      type="button"
                      className="btn btn-success"
                      disabled={totalDraftQty <= 0}
                      onClick={handleAddToQuoteClick}
                    >
                      Add to Quote
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-muted">(No stock table data)</div>
              )}
            </div>
          </div>
          

          {pendingQuoteItem && (
            <AddToQuoteModal
              show={showQuoteModal}
              onHide={() => setShowQuoteModal(false)}
              lineItemDraft={pendingQuoteItem}
              onAdded={() => {
                setSizeQtyDraft({}); // clear draft quantities after adding
                setShowQuoteModal(false);
                setPendingQuoteItem(null);
              }}
            />
          )}

          {/* Debug */}
          <div className="mt-4">
            <details>
              <summary className="text-muted">Debug: selectedSku</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(selectedSku, null, 2)}</pre>
            </details>
          </div>
        </>
      ) : (
        <div className="text-muted">
          {loading ? "Loading product…" : error ? error : !products.length ? "(No products found)" : "(No SKU found for this color)"}
        </div>
      )}
    </div>
  );
}
