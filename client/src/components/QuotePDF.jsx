import React from "react";
import { toMoney } from "../utils/money.js";
import {
  getLineItemTotalsAdjusted,
  getQuoteTotalsAdjusted,
} from "../utils/quotePricing.js";

export default function QuotePdf({ quote }) {
  if (!quote) return null;

  const totals = getQuoteTotalsAdjusted(quote.lineItems || []);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 20,
        color: "#333",
        width: "800px",
      }}
    >
      <h2 style={{ marginBottom: 4 }}>{quote.name}</h2>
      <div style={{ fontSize: 14, color: "#555", marginBottom: 10 }}>
        {quote.lineItems.length} items • {totals.totalQty} units
      </div>

      <hr />

      <div style={{ marginBottom: 10 }}>
        <strong>Customer:</strong> {quote.customer?.name || "—"} <br />
        <strong>Company:</strong> {quote.customer?.company || "—"} <br />
        <strong>Email:</strong> {quote.customer?.email || "—"} <br />
        <strong>Phone:</strong> {quote.customer?.phone || "—"} <br />
      </div>

      {quote.notes && (
        <div style={{ marginBottom: 10 }}>
          <strong>Notes:</strong> {quote.notes}
        </div>
      )}

      <hr />

      <div>
        {quote.lineItems.map((li) => {
          const sizeKeys = Object.keys(li.sizeQty || {});
          const lineTotals = getLineItemTotalsAdjusted(li);

          return (
            <div
              key={li.id}
              style={{
                borderBottom: "1px solid #ddd",
                paddingBottom: 10,
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {li.image && (
                  <img
                    src={li.image}
                    alt={li.title}
                    width={60}
                    height={60}
                    style={{ objectFit: "contain" }}
                    crossOrigin="anonymous"
                  />
                )}

                <div>
                  <div style={{ fontWeight: "bold" }}>{li.title}</div>

                  <div style={{ fontSize: 12, color: "#555" }}>
                    {li.brand ? `${li.brand} • ` : ""}
                    {li.styleNumber} • {li.color}
                  </div>

                  <div style={{ fontSize: 12, color: "#555" }}>
                    SKU: {li.sku || "—"} • GTIN: {li.gtin || "—"}
                  </div>
                </div>
              </div>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: 5,
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        borderBottom: "1px solid #aaa",
                        textAlign: "left",
                      }}
                    >
                      Size
                    </th>
                    <th
                      style={{
                        borderBottom: "1px solid #aaa",
                        textAlign: "right",
                      }}
                    >
                      Qty
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sizeKeys.map((s) => (
                    <tr key={s}>
                      <td>{s}</td>
                      <td style={{ textAlign: "right" }}>{li.sizeQty[s]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 6, fontSize: 13 }}>
                <div>
                  <strong>Cost per item:</strong>{" "}
                  {toMoney(lineTotals.qtyTotal ? lineTotals.costTotal / lineTotals.qtyTotal : 0)}
                </div>

                <div>
                  <strong>Sell per item:</strong> {toMoney(lineTotals.unitSellAvg)}
                </div>

                <div>
                  <strong>Markup:</strong>{" "}
                  {(li.markupType || "dollar") === "percent"
                    ? `${li.markupPerItem || 0}%`
                    : `$${li.markupPerItem || 0}`}
                </div>

                {(li.adjusters || []).length > 0 && (
                  <div>
                    <strong>Adjusters:</strong>{" "}
                    {lineTotals.perItemAdjusters
                      ? `${toMoney(lineTotals.perItemAdjusters)} / item`
                      : ""}
                    {lineTotals.perItemAdjusters && lineTotals.flatAdjusters
                      ? " • "
                      : ""}
                    {lineTotals.flatAdjusters
                      ? `${toMoney(lineTotals.flatAdjusters)} flat`
                      : ""}
                  </div>
                )}

                <div style={{ marginTop: 4, fontSize: 14 }}>
                  <strong>Line total:</strong> {toMoney(lineTotals.sellTotal)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <hr />

      <div style={{ fontSize: 16, fontWeight: "bold" }}>
        Total units: {totals.totalQty} • Total: {toMoney(totals.sellTotal)}
      </div>

      <div style={{ fontSize: 12, color: "#555" }}>
        Internal profit: {toMoney(totals.profit)}
      </div>
    </div>
  );
}
