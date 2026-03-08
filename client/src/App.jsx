import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";

export default function App() {
  const location = useLocation();

  // Hide layout if we're on the customer view page
  const isCustomerView = location.pathname.startsWith("/q/view/");

  if (isCustomerView) {
    // Only render the outlet (the QuoteCustomerViewPage)
    return <Outlet />;
  }

  // Otherwise render the normal admin layout
  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <Sidebar />

      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div>
          <h3 className="mb-1">Ink Hive Quote Generator</h3>
          <div className="text-muted">
            Load brands instantly, filter locally, then browse products.
          </div>
        </div>

        <Link to="/" className="btn btn-outline-secondary">
          Brands
        </Link>
      </div>

      <hr className="my-4" />

      <Outlet />
    </div>
  );
}
