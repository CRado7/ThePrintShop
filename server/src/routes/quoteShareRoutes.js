import express from "express";
import { createShareToken, getShareToken, setResponse } from "../shareTokenStore.js";
import { sendQuoteEmail } from "../email/sendEmail.js";

const router = express.Router();

/**
 * POST /quote/:quoteId/send-email
 * Send a quote via email to a customer
 */
router.post("/quote/:quoteId/send-email", async (req, res) => {
  try {
    const { quoteId } = req.params;
    const { quote, toEmail, message } = req.body;

    if (!quote) return res.status(400).json({ error: "Missing quote in request body" });
    if (!toEmail) return res.status(400).json({ error: "Missing toEmail" });
    if (quote.id !== quoteId) return res.status(400).json({ error: "quoteId mismatch" });

    // Generate share token
    const { token } = createShareToken({ quote });

    quote.status = "pending";

    // Use dynamic frontend origin if CLIENT_ORIGIN not set
    const frontendOrigin = process.env.CLIENT_ORIGIN || `${req.protocol}://${req.headers.host}`;
    const link = `${frontendOrigin}/q/view/${token}`;

    // HTML email
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background: #fdfdfd;">
        <h2 style="color: #0d6efd; margin-bottom: 5px;">${quote.name || "Your Quote"}</h2>
        <p style="margin-top: 0;">Hello${quote.customer?.name ? ` ${quote.customer.name}` : ""},</p>

        ${message ? `<p style="font-size: 14px; line-height: 1.5;">${message}</p>` : ""}

        <p style="font-size: 14px; line-height: 1.5;">You can review your quote by clicking the button below:</p>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="
            display: inline-block;
            background-color: #0d6efd;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
          ">View Quote</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <p style="font-size: 12px; color: #888; line-height: 1.4;">
          If the button doesn’t work, copy and paste this link into your browser:<br/>
          <a href="${link}" style="color: #0d6efd; word-break: break-all;">${link}</a>
        </p>

        <p style="font-size: 12px; color: #aaa; margin-top: 30px;">
          &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
      </div>
    `;

    // Send email
    await sendQuoteEmail({
      to: toEmail,
      subject: `Quote: ${quote.name || quoteId}`,
      html,
    });

    return res.json({ ok: true, status: "pending", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

/**
 * GET /quote-share/:token
 * Get a shared quote by token
 */
router.get("/quote-share/:token", (req, res) => {
  const { token } = req.params;
  const entry = getShareToken(token);
  if (!entry) return res.status(404).json({ error: "Invalid link" });

  const safeQuote = makeCustomerSafeQuote(entry.quote);

  res.json({
    quote: safeQuote,
    response: entry.response,
  });
});

/**
 * POST /quote-share/:token/respond
 * Submit a response (approve/reject) for a shared quote
 */
router.post("/quote-share/:token/respond", (req, res) => {
  const { token } = req.params;
  const entry = getShareToken(token);
  if (!entry) return res.status(404).json({ error: "Invalid link" });

  const { status, notes } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const response = setResponse(token, { status, notes });
  res.json({ ok: true, response });
});

/**
 * Convert a quote to a “customer-safe” version (hide internal pricing)
 */
function makeCustomerSafeQuote(quote) {
  return {
    id: quote.id,
    name: quote.name,
    notes: quote.notes || "",
    customer: {
      name: quote.customer?.name || "",
      company: quote.customer?.company || "",
      email: quote.customer?.email || "",
      phone: quote.customer?.phone || "",
    },
    lineItems: (quote.lineItems || []).map(li => ({
      id: li.id,
      title: li.title,
      brand: li.brand,
      styleNumber: li.styleNumber,
      color: li.color,
      image: li.image,
      sizeQty: li.sizeQty,
      markupType: li.markupType,
      markupPerItem: li.markupPerItem,
      adjusters: li.adjusters || [],
      costBySize: li.costBySize || {},
    })),
  };
}

export default router;
