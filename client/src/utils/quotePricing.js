// utils/quoteAdjustedMath.js

// --- Adjuster helpers ---
export function getPerItemAdjusterTotal(adjusters = []) {
  return adjusters
    .filter((a) => a?.type === "perItem")
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);
}

export function getFlatAdjusterTotal(adjusters = []) {
  return adjusters
    .filter((a) => a?.type === "flat")
    .reduce((sum, a) => sum + Number(a.amount || 0), 0);
}

// --- Unit price calculation ---
export function getUnitSellPrice({ unitCost, markupType = "dollar", markupPerItem = 0, perItemAdjusters = 0 }) {
  let unitSell = Number(unitCost || 0);

  if (markupType === "dollar") {
    unitSell += Number(markupPerItem || 0);
  } else {
    unitSell *= 1 + Number(markupPerItem || 0) / 100;
  }

  // add per-item adjusters
  unitSell += Number(perItemAdjusters || 0);

  return unitSell;
}

// --- Line item totals (internal) ---
export function getLineItemTotalsAdjusted(lineItem) {
  const sizeQty = lineItem.sizeQty || {};
  const costBySize = lineItem.costBySize || {};
  const adjusters = lineItem.adjusters || [];

  const perItemAdjusters = getPerItemAdjusterTotal(adjusters);
  const flatAdjusters = getFlatAdjusterTotal(adjusters);

  let qtyTotal = 0;
  let sellTotal = 0;
  let profit = 0;
  let costTotal = 0;

  for (const size of Object.keys(sizeQty)) {
    const qty = Number(sizeQty[size] || 0);
    if (qty <= 0) continue;

    const unitCost = Number(costBySize[size] || 0);
    const unitSell = getUnitSellPrice({
      unitCost,
      markupType: lineItem.markupType || "dollar",
      markupPerItem: lineItem.markupPerItem || 0,
      perItemAdjusters,
    });

    qtyTotal += qty;
    costTotal += unitCost * qty;
    sellTotal += unitSell * qty;
    profit += (unitSell - unitCost) * qty;
  }

  // Add flat adjusters AFTER per-unit math
  sellTotal += flatAdjusters;
  profit += flatAdjusters;

  const unitSellAvg = qtyTotal > 0 ? sellTotal / qtyTotal : 0;

  return {
    qtyTotal,
    sellTotal,
    profit,
    costTotal,
    unitSellAvg,
    perItemAdjusters,
    flatAdjusters,
  };
}

// --- Quote totals ---
export function getQuoteTotalsAdjusted(lineItems = []) {
  let totalQty = 0;
  let sellTotal = 0;
  let profit = 0;

  for (const li of lineItems) {
    const totals = getLineItemTotalsAdjusted(li);
    totalQty += totals.qtyTotal;
    sellTotal += totals.sellTotal;
    profit += totals.profit;
  }

  return { totalQty, sellTotal, profit };
}

// --- Customer-facing pricing table ---
export function getLineItemCustomerPricing(lineItem) {
  const sizeQty = lineItem.sizeQty || {};
  const costBySize = lineItem.costBySize || {};
  const adjusters = lineItem.adjusters || [];

  const perItemAdjusters = getPerItemAdjusterTotal(adjusters);
  const flatAdjusters = getFlatAdjusterTotal(adjusters);

  let totalQty = 0;
  let lineTotal = 0;

  const rows = Object.keys(sizeQty).map((size) => {
    const qty = Number(sizeQty[size] || 0);
    const unitCost = Number(costBySize[size] || 0);

    const unitSell = getUnitSellPrice({
      unitCost,
      markupType: lineItem.markupType || "dollar",
      markupPerItem: lineItem.markupPerItem || 0,
      perItemAdjusters,
    });

    const total = unitSell * qty;
    totalQty += qty;
    lineTotal += total;

    return { size, qty, unitSell, total };
  });

  // Add flat adjusters after per-size math
  lineTotal += flatAdjusters;

  return { rows, totalQty, lineTotal, flatAdjusters, perItemAdjusters };
}

// --- Quote totals for customer view ---
export function getQuoteCustomerTotals(lineItems = []) {
  let totalQty = 0;
  let sellTotal = 0;

  for (const li of lineItems) {
    const pricing = getLineItemCustomerPricing(li);
    totalQty += pricing.totalQty;
    sellTotal += pricing.lineTotal;
  }

  return { totalQty, sellTotal };
}
