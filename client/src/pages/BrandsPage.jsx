import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetBrands } from "../api/catalogApi"; // your API call
import BrandGrid from "../components/BrandGrid";

export default function BrandsPage() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [brandFilter, setBrandFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);

        const data = await apiGetBrands();
        // backend is assumed to send already normalized data with brandID
        setBrands(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || "Failed to load brands");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function pickBrand(brand) {
    // navigate to BrandProductsPage using brandID
    navigate(`/brand/${brand.brandID}`);
  }

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3 d-flex align-items-center justify-content-between">
        <h5 className="m-0">Brands</h5>
        {loading && <span className="small text-muted">Loading…</span>}
      </div>

      <input
        className="form-control mb-3"
        placeholder="Filter brands (bella, gildan, next level…)"
        value={brandFilter}
        onChange={(e) => setBrandFilter(e.target.value)}
      />

      {loading ? (
        <div className="text-muted">Loading brands…</div>
      ) : (
        <BrandGrid
          brands={brands}
          filter={brandFilter}
          onPickBrand={pickBrand}
        />
      )}
    </div>
  );
}
