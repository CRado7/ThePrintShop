import crypto from "crypto";

const tokens = new Map();
// token -> { quote, createdAt, response }

export function createShareToken({ quote }) {
  const token = crypto.randomBytes(32).toString("hex");

  tokens.set(token, {
    quote,
    createdAt: new Date(),
    response: null, // { status, notes, respondedAt }
  });

  return { token };
}

export function getShareToken(token) {
  return tokens.get(token);
}

export function setResponse(token, { status, notes }) {
  const entry = tokens.get(token);
  if (!entry) return null;

  entry.response = {
    status,
    notes: notes || "",
    respondedAt: new Date(),
  };

  return entry.response;
}
