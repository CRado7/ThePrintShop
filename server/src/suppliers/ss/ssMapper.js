// ssMapper.js — backend

/**
 * Safely unwraps raw API responses to always return an array
 */
function unwrapArray(raw) {
  if (Array.isArray(raw)) return raw;
  return raw?.Items || raw?.items || raw?.Data || raw?.data || [];
}

/**
 * Normalize a single brand
 */
export function mapSsBrandToNormalized(b) {
  const id =
    b?.BrandID ??
    b?.brandID ??
    b?.brandId ??
    b?.Id ??
    b?.id;

  const name =
    b?.Name ??
    b?.name ??
    b?.BrandName ??
    b?.brandName ??
    b?.Description ??
    "";

  // URL-friendly ID for frontend routes
  const brandID = name ? name.toLowerCase().replace(/\s+/g, "-") : "";

  return {
    id: `ss-brand-${id}`,
    supplier: "ss",
    brandId: id,    // original backend ID
    brandID,        // URL-friendly for frontend routing
    name,
    image: b?.image || b?.Image || null,
    activeProducts: b?.activeProducts ?? b?.ActiveProducts ?? null,
  };
}

/**
 * Normalize an array of brands
 */
export function mapSsBrandsToNormalized(raw) {
  return unwrapArray(raw)
    .map(mapSsBrandToNormalized)
    .filter((b) => b.name);
}

/**
 * Normalize a single product
 */
export function mapSsProductToNormalized(p) {
  const sku = p?.Sku || p?.SKU || p?.sku;
  const skuId = p?.SkuID || p?.SkuId || p?.skuid;
  const gtin = p?.Gtin || p?.GTIN || p?.gtin;

  const styleID = p?.StyleID || p?.styleID;
  const styleName = p?.StyleName || p?.styleName;
  const partNumber = p?.PartNumber || p?.partnumber;
  const brandName = p?.brandName || p?.Brand || p?.brand;
  const title = p?.Name || p?.Description || p?.Title || "";

  const displayImage = p?.colorFrontImage || p?.ColorFrontImage || "";
  const colorFrontImage = displayImage;
  const colorSwatchImage = p?.colorSwatchImage || "";
  const colorBackImage = p?.colorBackImage || "";
  const colorSideImage = p?.colorSideImage || "";

  const identifier = sku || skuId || gtin || p?.Identifier;

  const brandID = brandName ? brandName.toLowerCase().replace(/\s+/g, "-") : "";

  return {
    id: identifier ? `ss-${identifier}` : `ss-unknown-${Math.random()}`,
    supplier: "ss",

    identifier,
    sku,
    skuId,
    gtin,

    brandName,
    brandID,
    styleName,
    styleID,
    partNumber,

    displayImage,
    colorFrontImage,
    colorSwatchImage,
    colorBackImage,
    colorSideImage,

    title,
    raw: p,
  };
}

/**
 * Normalize a single style
 */
export function mapSsStyleToNormalized(s) {
  const styleID = s?.styleID ?? s?.StyleID ?? null;
  const partNumber = s?.partNumber ?? s?.PartNumber ?? null;

  const brandName = s?.brandName ?? s?.BrandName ?? "";
  const styleName = s?.styleName ?? s?.StyleName ?? s?.Name ?? "";
  const title = s?.title ?? s?.Title ?? "";
  const description = s?.description ?? s?.Description ?? "";

  const baseCategory = s?.baseCategory ?? s?.BaseCategory ?? "";
  const categories = s?.categories ?? s?.Categories ?? "";
  const catalogPageNumber = s?.catalogPageNumber ?? s?.CatalogPageNumber ?? "";

  const brandImage = s?.brandImage ?? s?.BrandImage ?? "";
  const styleImage = s?.styleImage ?? s?.StyleImage ?? "";

  // URL-friendly brandID for frontend routing
  const brandID = brandName ? brandName.toLowerCase().replace(/\s+/g, "-") : "";

  const identifier = styleID || partNumber || `${brandName}-${styleName}`;

  // console.log("Mapping Raw Style:", s);

  return {
    id: `ss-style-${identifier}`,
    supplier: "ss",
    styleID,
    partNumber,
    brandName,
    brandID,  // <- used in frontend filtering
    styleName,
    title,
    description,
    baseCategory,
    categories,
    catalogPageNumber,
    brandImage,
    styleImage,
    raw: s,
  };
}

/**
 * Normalize an array of styles
 */
export function mapSsStylesToNormalized(raw) {
  return unwrapArray(raw)
    .map(mapSsStyleToNormalized)
    .filter((s) => s.styleID || s.partNumber);
}

/**
 * Normalize search results (products)
 */
export function mapSsSearchToNormalized(raw) {
  return unwrapArray(raw).map(mapSsProductToNormalized);
}
