
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App.jsx";
import BrandsPage from "./pages/BrandsPage.jsx";
import BrandProductsPage from "./pages/BrandProductsPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import QuotesPage from "./pages/QuotesPage.jsx";
import QuoteEditorPage from "./pages/QuoteEditorPage.jsx";
import QuoteCustomerViewPage from "./pages/QuoteCustomerViewPage.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <BrandsPage /> },
      { path: "brand/:brandId", element: <BrandProductsPage /> },
      { path: "product/:productId", element: <ProductPage /> },
      { path: "quotes", element: <QuotesPage /> },
      { path: "quote/:quoteId", element: <QuoteEditorPage /> },
      { path: "q/view/:token", element: <QuoteCustomerViewPage /> },

    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);