export async function ssFetch(
  path,
  { method = "GET", query = {}, debugLabel = "" } = {}
) {
  const base = process.env.SS_API_BASE;
  const accountNumber = process.env.SS_API_KEY;
  const apiKey = process.env.SS_API_SECRET;

  if (!base || !accountNumber || !apiKey) {
    throw new Error(
      "Missing env vars: SS_API_BASE, SS_API_KEY (Account Number), SS_API_SECRET (API Key)"
    );
  }

  // Normalize base + path
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  const normalizedPath = String(path || "")
    .replace(/^\//, "")
    .replace(/\/$/, "");

  const url = new URL(normalizedPath, normalizedBase);

  // Query params
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  // Basic auth
  const basicAuth =
    "Basic " + Buffer.from(`${accountNumber}:${apiKey}`).toString("base64");

  const headers = {
    Accept: "application/json",
    Authorization: basicAuth,
  };

  const label = debugLabel ? ` (${debugLabel})` : "";
  console.log(`Calling S&S API${label}:`, url.toString());

  const res = await fetch(url, { method, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("S&S API response error:", text);
    throw new Error(`S&S API error ${res.status}: ${text}`);
  }

  return res.json();
}