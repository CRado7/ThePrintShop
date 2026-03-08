// StyleGrid.jsx
import { useEffect, useMemo, useState } from "react";
import StyleCard from "./StyleCard.jsx";

const PAGE_SIZE = 21;

export default function StyleGrid({ styles, filter, onPickStyle }) {
  const [page, setPage] = useState(1);

  // Filter styles
  const filtered = useMemo(() => {
    const q = String(filter || "").trim().toLowerCase();
    if (!q) return styles;

    return styles.filter((s) => {
      const haystack = [
        s.brandName,
        s.styleName,
        s.styleID,
        s.partNumber,
        s.baseCategory,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [styles, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Slice current page
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => setPage(1), [filter, styles]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  useEffect(() => window.scrollTo({ top: 0, behavior: "smooth" }), [page]);

  function getPaginationPages(current, total) {
    const pages = new Set([1, total, current, current - 1, current + 1]);
    if (current <= 3) pages.add(2).add(3).add(4);
    if (current >= total - 2) pages.add(total - 1).add(total - 2).add(total - 3);

    const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
      result.push(sorted[i]);
    }
    return result;
  }

  return (
    <div>
      {/* Pagination info & controls */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="text-muted small">
          Showing{" "}
          <span className="fw-semibold">
            {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)}
          </span>{" "}
          of <span className="fw-semibold">{filtered.length}</span> styles
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="row g-3">
        {pageItems.map((style) => (
          <div key={style.styleID || style.id} className="col-12 col-md-6 col-lg-4">
            <StyleCard style={style} onPickStyle={onPickStyle} />
          </div>
        ))}
      </div>

      {/* Pagination numbers */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <div className="btn-group flex-wrap">
            {getPaginationPages(page, totalPages).map((item, idx) =>
              item === "…" ? (
                <button key={`dots-${idx}`} className="btn btn-sm btn-outline-secondary" disabled>
                  …
                </button>
              ) : (
                <button
                  key={item}
                  className={`btn btn-sm ${item === page ? "btn-dark" : "btn-outline-secondary"}`}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
