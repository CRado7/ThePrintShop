const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export async function apiGetSharedQuote(token) {
  const res = await fetch(`${API_BASE}/api/quote-share/${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load quote");
  return data;
}

export async function apiRespondToSharedQuote(token, { status, notes }) {
  const res = await fetch(`${API_BASE}/api/quote-share/${token}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit response");
  return data;
}
