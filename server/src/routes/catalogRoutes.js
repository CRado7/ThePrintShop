import express from "express";
import { suppliers } from "../suppliers/index.js";

export const catalogRoutes = express.Router();

// GET /api/catalog/brands?supplier=ss
catalogRoutes.get("/brands", async (req, res, next) => {
  try {
    const supplier = String(req.query.supplier || "ss");
    const svc = suppliers[supplier];

    if (!svc?.getBrands) {
      return res.status(400).json({ error: "Supplier does not support brands" });
    }

    const brands = await svc.getBrands();
    res.json(brands);
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/brand-products?supplier=ss&brand=Bella%20%2B%20Canvas
catalogRoutes.get("/brand-products", async (req, res, next) => {
  try {
    const supplier = String(req.query.supplier || "ss");
    const brandId = String(req.query.brandId || "").trim();

    const svc = suppliers[supplier];

    if (!svc?.getProductsByBrandId) {
      return res
        .status(400)
        .json({ error: "Supplier does not support brand-products" });
    }

    const products = await svc.getProductsByBrandId({ brandId });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

catalogRoutes.get("/brand-styles", async (req, res, next) => {
  try {
    const supplier = String(req.query.supplier || "ss");
    const brandId = String(req.query.brandId || "").trim();

    const svc = suppliers[supplier];

    if (!svc?.getStylesByBrandId) {
      return res.status(400).json({ error: "Supplier does not support brand-styles" });
    }

    const styles = await svc.getStylesByBrandId({ brandId });
    res.json(styles);
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/product?supplier=ss&id=ss-B00760004
catalogRoutes.get("/product", async (req, res, next) => {
  try {
    const supplier = String(req.query.supplier || "ss");
    const id = String(req.query.id || "").trim();

    const svc = suppliers[supplier];

    if (!svc?.getProductById) {
      return res.status(400).json({ error: "Supplier does not support product" });
    }

    const product = await svc.getProductById({ productId: id });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

catalogRoutes.get("/style-products", async (req, res, next) => {
  try {
    const supplier = String(req.query.supplier || "ss");
    const styleId = String(req.query.styleId || "").trim();

    if (!styleId) return res.status(400).json({ error: "styleId is required" });

    const svc = suppliers[supplier];
    if (!svc?.getProductsByStyle) {
      return res.status(400).json({ error: "Supplier does not support style-products" });
    }

    const products = await svc.getProductsByStyle({ styleId });
    res.json(products);
  } catch (err) {
    next(err);
  }
});