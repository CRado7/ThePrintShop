const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

export async function apiGetBrands() {
  const res = await fetch(`${API_BASE}/api/catalog/brands?supplier=ss`);
  if (!res.ok) throw new Error("Failed to load brands");
  return res.json();
}

export async function apiGetProductsByBrand(brandId) {
  const url = new URL(`${API_BASE}/api/catalog/brand-products`);
  url.searchParams.set("supplier", "ss");
  url.searchParams.set("brandId", String(brandId));

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load brand products");

  const data = await res.json();
  // Return array, whether data.products exists or data itself is array
  return Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
}


export async function apiGetProduct(id) {
  const url = new URL(`${API_BASE}/api/catalog/product`);
  url.searchParams.set("supplier", "ss");
  url.searchParams.set("id", id);

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to load product");
  }
  return res.json();
}

// NEW: fetch styles by brandID
export async function apiGetStylesByBrand(brandId) {
  const res = await fetch(`/api/catalog/brand-styles?brandId=${encodeURIComponent(brandId)}&supplier=ss`);
  return res.json();
}

// Fetch all SKUs for a style (used in ProductPage)
export async function apiGetProductsByStyle(styleId) {
  const url = new URL(`${API_BASE}/api/catalog/style-products`);
  url.searchParams.set("supplier", "ss");
  url.searchParams.set("styleId", styleId);

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load style products");

  const data = await res.json();
  return Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
}
