import { ssFetch } from "./ssClient.js";
import {
  mapSsBrandsToNormalized,
  mapSsProductToNormalized,
  mapSsSearchToNormalized,
  mapSsStylesToNormalized,
} from "./ssMapper.js";

// Cache brands so we don’t hammer the API
let brandsCache = null;
let brandsCacheAt = 0;
const BRANDS_TTL_MS = 1000 * 60 * 60; // 1 hour

export const ssService = {
  /**
   * GET /v2/Brands
   */
  async getBrands({ force = false } = {}) {
    const now = Date.now();

    if (!force && brandsCache && now - brandsCacheAt < BRANDS_TTL_MS) {
      return brandsCache;
    }

    const raw = await ssFetch("Brands", { debugLabel: "getBrands" });

    const normalized = mapSsBrandsToNormalized(raw);

    // sort alphabetically
    normalized.sort((a, b) => a.name.localeCompare(b.name));

    brandsCache = normalized;
    brandsCacheAt = now;

    return normalized;
  },

  /**
   * GET /v2/products?style={brandName}
   */
  async getProductsByBrandName({ brandName }) {
    const name = String(brandName || "").trim();
    if (!name) return [];

    const raw = await ssFetch("products", {
      query: { style: name },
      debugLabel: `brandStyle=${name}`,
    });

    return mapSsSearchToNormalized(raw);
  },

  /**
   * GET /v2/products?brandID={id}
   */
  async getProductsByBrandId({ brandId }) {
    const id = String(brandId || "").trim();
    if (!id) return [];

    const raw = await ssFetch("products", {
      query: { brandID: id },
      debugLabel: `brandID=${id}`,
    });

    return mapSsSearchToNormalized(raw);
  },

  /**
   * GET /v2/styles?brandID={id}
   */
  async getStylesByBrandId({ brandId }) {
    const id = String(brandId || "").trim();
    if (!id) return [];

    const raw = await ssFetch("styles", {
      query: { brandID: id },
      debugLabel: `styles brandID=${id}`,
    });

    return mapSsStylesToNormalized(raw);
  },

  /**
   * GET /v2/products/{identifier}
   */
  async getProductById({ productId }) {
    const cleanId = String(productId || "")
      .replace(/^ss-/, "")
      .trim();

    if (!cleanId) throw new Error("productId is required");

    const raw = await ssFetch(`products/${encodeURIComponent(cleanId)}`, {
      debugLabel: `product=${cleanId}`,
    });

    return mapSsProductToNormalized(raw);
  },

  /**
 * GET /v2/products?styleid={styleID}
 */
async getProductsByStyle({ styleId }) {
  const id = String(styleId || "").trim();
  if (!id) return [];

  // SS API accepts /v2/products/?styleid=39
  const raw = await ssFetch("products", {
    query: { styleid: id },
    debugLabel: `styleID=${id}`,
  });

  return mapSsSearchToNormalized(raw);
},

/**
 * GET /v2/products?baseCategory={category}
 */

async getProductsByBaseCategory({ baseCategory }) {
  const category = String(baseCategory || "").trim();
  if (!category) return [];

  const raw = await ssFetch("products", {
    query: { baseCategory: category },
    debugLabel: `baseCategory=${category}`,
  });

  return mapSsSearchToNormalized(raw);
}

};
