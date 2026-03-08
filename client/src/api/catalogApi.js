const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function apiGetBrands() {
  const res = await fetch(`${API_BASE}/api/catalog/brands?supplier=ss`);
  if (!res.ok) throw new Error("Failed to load brands");
  return res.json();
}

export async function apiGetProductsByBrand(brandId) {
  const params = new URLSearchParams({ supplier: "ss", brandId: String(brandId) });
  const res = await fetch(`${API_BASE}/api/catalog/brand-products?${params}`);
  if (!res.ok) throw new Error("Failed to load brand products");

  const data = await res.json();
  return Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
}

export async function apiGetProduct(id) {
  const params = new URLSearchParams({ supplier: "ss", id });
  const res = await fetch(`${API_BASE}/api/catalog/product?${params}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to load product");
  }
  return res.json();
}

export async function apiGetStylesByBrand(brandId) {
  const params = new URLSearchParams({ supplier: "ss", brandId: String(brandId) });
  const res = await fetch(`${API_BASE}/api/catalog/brand-styles?${params}`);
  return res.json();
}

export async function apiGetProductsByStyle(styleId) {
  const params = new URLSearchParams({ supplier: "ss", styleId });
  const res = await fetch(`${API_BASE}/api/catalog/style-products?${params}`);
  if (!res.ok) throw new Error("Failed to load style products");

  const data = await res.json();
  return Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
}