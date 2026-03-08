import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGetStylesByBrand } from "../api/catalogApi"; 
import StyleGrid from "../components/StyleGrid.jsx";

export default function BrandProductsPage() {
  const { brandId } = useParams();
  const decodedBrandId = decodeURIComponent(brandId || "");
  const navigate = useNavigate();

  const [styles, setStyles] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiGetStylesByBrand(decodedBrandId);
        const normalized = Array.isArray(data) ? data : [];

        const brandStyles = normalized.filter(
          (s) => s.brandID === decodedBrandId
        );

        setStyles(brandStyles);
      } catch (e) {
        setError(e?.message || "Failed to load styles");
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedBrandId]);

  const pickStyle = (style) => {
    navigate(`/product/${encodeURIComponent(style.styleID)}`);
  };

  // --- Count styles per baseCategory ---
  const categoryCounts = useMemo(() => {
    const counts = {};
    styles.forEach((s) => {
      if (!s.baseCategory) return;
      counts[s.baseCategory] = (counts[s.baseCategory] || 0) + 1;
    });
    return counts;
  }, [styles]);

  const baseCategories = useMemo(() => Object.keys(categoryCounts), [categoryCounts]);

  // --- Filtered styles ---
  const filteredStyles = useMemo(() => {
    return styles.filter((s) => {
      const matchesCategory = selectedCategory
        ? s.baseCategory === selectedCategory
        : true;

      const matchesSearch = filter
        ? [s.title, s.styleName, s.styleID, s.partNumber]
            .some((v) => v.toLowerCase().includes(filter.toLowerCase()))
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [styles, selectedCategory, filter]);

  const brandDisplayName = styles?.[0]?.brandName ?? decodedBrandId;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <Link to="/" className="btn btn-outline-secondary">
          ← Back to Brands
        </Link>
        {loading && <span className="text-muted">Loading…</span>}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h5 className="m-0">{brandDisplayName}</h5>
              <div className="text-muted small">{styles.length} styles</div>
            </div>

            {/* --- Search + Category Filter --- */}
            <div className="d-flex gap-2 flex-wrap">
              <input
                className="form-control"
                style={{ maxWidth: 200 }}
                placeholder="Search styles (title, part #, styleID…)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />

              <select
                className="form-select"
                style={{ maxWidth: 220 }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {baseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({categoryCounts[cat]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="my-3" />

          {loading ? (
            <div className="text-muted">Loading styles…</div>
          ) : (
            <StyleGrid
              styles={filteredStyles}
              filter={filter}
              onPickStyle={pickStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}
