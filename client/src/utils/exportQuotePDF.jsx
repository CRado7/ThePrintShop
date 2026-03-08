import React from "react";
import ReactDOM from "react-dom/client"; // for React 18+
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QuotePdf from "../components/QuotePDF.jsx";

export async function exportQuotePdf(quote, totals) {
  // create hidden container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  // render the React component into container
  const root = ReactDOM.createRoot(container);
  root.render(<QuotePdf quote={quote} totals={totals} />);

  // wait a tick to ensure images load
  await new Promise((r) => setTimeout(r, 500));

  // render canvas
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    allowTaint: true, // allows cross-origin if CORS headers exist
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${quote.name || "quote"}.pdf`);

  // cleanup
  root.unmount();
  document.body.removeChild(container);
}

