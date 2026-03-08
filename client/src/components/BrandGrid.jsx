// ===============================
// BrandGrid.jsx
// Reusable BrandGrid + BrandCard
// Sorts valid images first, broken/missing images last
// ===============================

import { useEffect, useMemo, useState } from "react";

// ---------------------------
// Helper: test if image loads
// ---------------------------
function checkImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// ---------------------------
// BrandCard Component
// ---------------------------
export function BrandCard({ brand, onClick }) {
  const imageUrl = brand.image
    ? `https://www.ssactivewear.com/${String(brand.image).replace(/^\/+/, "")}`
    : null;

  const hasImage = Boolean(imageUrl);

  return (
    <div
      className="card text-center h-100 shadow-sm border-0 bg-white"
      style={{ cursor: "pointer" }}
      onClick={() => onClick(brand)}
    >
      {hasImage ? (
        <>
          <img
            src={imageUrl}
            alt={brand.name}
            className="card-img-top"
            style={{
              objectFit: "contain",
              height: 110,
              padding: 10,
            }}
            loading="lazy"
            onError={(e) => {
              // If the image 404s, hide it so it doesn't look broken
              e.currentTarget.style.display = "none";
            }}
          />

          <div className="card p-2 bg-light border-0">
            <div className="small fw-semibold">{brand.name}</div>
          </div>
        </>
      ) : (
        <div className="card-body p-3">
          <div className="fw-semibold">{brand.name}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// BrandGrid Component
// ---------------------------
export default function BrandGrid({ brands, filter = "", onPickBrand }) {
  const [validImageMap, setValidImageMap] = useState({});

  // 1) Filter brands by name
  const filtered = useMemo(() => {
    const q = String(filter || "").trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, filter]);

  // 2) Check images for filtered brands
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const entries = await Promise.all(
        filtered.map(async (b) => {
          if (!b.image) return [b.id, false];

          const url = `https://www.ssactivewear.com/${String(b.image).replace(
            /^\/+/,
            ""
          )}`;

          const ok = await checkImage(url);
          return [b.id, ok];
        })
      );

      if (cancelled) return;

      const map = {};
      for (const [id, ok] of entries) map[id] = ok;

      setValidImageMap(map);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [filtered]);

  // 3) Sort: valid images first, broken/missing last
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aOk = !!validImageMap[a.id];
      const bOk = !!validImageMap[b.id];

      // valid images first
      if (aOk && !bOk) return -1;
      if (!aOk && bOk) return 1;

      // if both same, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [filtered, validImageMap]);

  if (sorted.length === 0) {
    return <div className="text-muted p-3">No brands match.</div>;
  }

  return (
    <div className="row g-3">
      {sorted.map((b) => (
        <div key={b.id} className="col-6 col-md-4 col-lg-4">
          <BrandCard
            brand={b}
            onClick={onPickBrand}
            hasValidImage={!!validImageMap[b.id]}
          />
        </div>
      ))}
    </div>
  );
}
