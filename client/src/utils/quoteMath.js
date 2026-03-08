import { round2 } from "./money.js";

export function getLineItemTotals(lineItem) {
  const sizeQty = lineItem.sizeQty || {};
  const costBySize = lineItem.costBySize || {};

  const markupPerItem = Number(lineItem.markupPerItem || 0);

  const adjusters = Array.isArray(lineItem.adjusters) ? lineItem.adjusters : [];
  const perItemAdj = adjusters
    .filter((a) => a.type === "perItem")
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  const flatAdj = adjusters
    .filter((a) => a.type === "flat")
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);

  let totalQty = 0;
  let sellSubtotal = 0;
  let costSubtotal = 0;

  for (const [size, qtyRaw] of Object.entries(sizeQty)) {
    const qty = Number(qtyRaw || 0);
    if (!qty) continue;

    totalQty += qty;

    const cost = Number(costBySize[size] || 0);
    const sellUnit = cost + markupPerItem + perItemAdj;

    costSubtotal += qty * cost;
    sellSubtotal += qty * sellUnit;
  }

  const sellTotal = sellSubtotal + flatAdj;

  const profit = sellTotal - costSubtotal;

  return {
    totalQty,
    costSubtotal: round2(costSubtotal),
    sellSubtotal: round2(sellSubtotal),
    sellTotal: round2(sellTotal),
    profit: round2(profit),
    perItemAdj: round2(perItemAdj),
    flatAdj: round2(flatAdj)
  };
}

export function getQuoteTotals(lineItems) {
  const items = Array.isArray(lineItems) ? lineItems : [];

  return items.reduce(
    (acc, li) => {
      const t = getLineItemTotals(li);
      acc.totalQty += t.totalQty;
      acc.costSubtotal += t.costSubtotal;
      acc.sellSubtotal += t.sellSubtotal;
      acc.sellTotal += t.sellTotal;
      acc.profit += t.profit;
      return acc;
    },
    {
      totalQty: 0,
      costSubtotal: 0,
      sellSubtotal: 0,
      sellTotal: 0,
      profit: 0
    }
  );
}