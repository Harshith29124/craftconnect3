require("dotenv").config();

const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// Read from environment
const STORE = process.env.SHOPIFY_STORE_DOMAIN; // e.g. craft-connect-demo1.myshopify.com
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN; // Admin API access token (shpat_...)
const API_VER = process.env.SHOPIFY_API_VERSION || "2025-10";
const LOC_ID = process.env.LOCATION_ID; // Optional but recommended for inventory

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
}

requireEnv("SHOPIFY_STORE_DOMAIN");
requireEnv("SHOPIFY_ADMIN_TOKEN");

async function shopifyFetch(path, init = {}) {
  const url = `https://${STORE}/admin/api/${API_VER}${path}`;
  const headers = {
    "X-Shopify-Access-Token": TOKEN,
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  const res = await fetch(url, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = `Shopify ${init.method || "GET"} ${path} failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// Health for Shopify integration
router.get("/health", async (req, res) => {
  return res.json({
    ok: true,
    store: STORE,
    version: API_VER,
    location: LOC_ID || null,
  });
});

// List products (for quick verification)
router.get("/products", async (req, res) => {
  try {
    const data = await shopifyFetch(`/products.json`);
    res.json(data);
  } catch (e) {
    res
      .status(e.status || 500)
      .json({ error: e.message, details: e.body || null });
  }
});

// Helper: build product payload from session object
function buildProductFromSession(session, artisanId) {
  const name =
    session?.productAnalysis?.productSummary?.name ||
    session?.businessSummary?.businessName ||
    "Craft Product";

  // Generate a simple description HTML from available fields
  const summary = session?.productAnalysis?.productSummary || {};
  const insights =
    session?.marketingInsights ||
    session?.productAnalysis?.marketingInsights ||
    {};

  const materials = Array.isArray(summary.materials)
    ? summary.materials.join(", ")
    : summary.materials || "";
  const features = Array.isArray(summary.uniqueFeatures)
    ? summary.uniqueFeatures.join(", ")
    : summary.uniqueFeatures || "";

  const descHtml = `
    <div>
      <p>${summary.description || "Handcrafted artisan product."}</p>
      <ul>
        ${materials ? `<li><strong>Materials:</strong> ${materials}</li>` : ""}
        ${features ? `<li><strong>Features:</strong> ${features}</li>` : ""}
        ${
          summary.timeToMake
            ? `<li><strong>Time to make:</strong> ${summary.timeToMake}</li>`
            : ""
        }
        ${
          summary.qualityLevel
            ? `<li><strong>Quality:</strong> ${summary.qualityLevel}</li>`
            : ""
        }
      </ul>
    </div>
  `;

  // Price: prefer numeric field; fallback try to parse from pricingRange like "₹500-700"
  let price = session?.product?.price || session?.productAnalysis?.price;
  if (!price && typeof insights.pricingRange === "string") {
    const match = insights.pricingRange.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (match) price = match[1];
  }
  if (!price) price = 299; // sensible default

  // Image URLs: expect backend to have stored URLs already (e.g., Cloudinary)
  const imageUrls = Array.isArray(session?.imageUrls)
    ? session.imageUrls
    : Array.isArray(session?.productImages)
    ? session.productImages
    : [];

  return {
    title: name,
    body_html: descHtml,
    status: "active",
    tags: artisanId ? [`artisan:${artisanId}`] : [],
    variants: [{ price: String(price) }],
    images: (imageUrls || []).map((src) => ({ src })),
  };
}

// Publish from session id: pulls server-side data only
// Body: { sessionId: string, artisanId?: string, quantity?: number }
router.post("/publish-from-session", async (req, res) => {
  try {
    const { sessionId, artisanId, quantity } = req.body || {};
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    // Either read directly from DB model or call existing session API
    // Prefer calling internal route to avoid model coupling
    const baseUrl =
      process.env.INTERNAL_BASE_URL ||
      `http://localhost:${process.env.PORT || 8080}`;
    const sessionRes = await fetch(`${baseUrl}/api/session/${sessionId}`);
    if (!sessionRes.ok) {
      const txt = await sessionRes.text();
      return res
        .status(502)
        .json({ error: "Failed to fetch session", details: txt });
    }
    const sessionJson = await sessionRes.json();
    const session = sessionJson.session || sessionJson; // support both shapes

    // Build product payload from session
    const productPayload = {
      product: buildProductFromSession(session, artisanId),
    };

    // Create product in Shopify
    const createResp = await shopifyFetch(`/products.json`, {
      method: "POST",
      body: JSON.stringify(productPayload),
    });

    const { product } = createResp;
    const variant = product?.variants?.[0];
    const variantId = variant?.id;
    const inventoryItemId = variant?.inventory_item_id;
    const productUrl = `https://${STORE}/products/${product.handle}`;

    // Auto-inventory if location present
    let inventory = null;
    if (LOC_ID && variantId && inventoryItemId) {
      await shopifyFetch(`/variants/${variantId}.json`, {
        method: "PUT",
        body: JSON.stringify({
          variant: { id: variantId, inventory_management: "shopify" },
        }),
      });

      const available = Number.isFinite(Number(quantity))
        ? Number(quantity)
        : 10;
      inventory = await shopifyFetch(`/inventory_levels/set.json`, {
        method: "POST",
        body: JSON.stringify({
          location_id: Number(LOC_ID),
          inventory_item_id: inventoryItemId,
          available,
        }),
      });
    }

    return res.json({
      ok: true,
      product,
      url: productUrl,
      autoInventory: LOC_ID ? { location_id: LOC_ID, result: inventory } : null,
    });
  } catch (e) {
    return res
      .status(e.status || 500)
      .json({ error: e.message, details: e.body || null });
  }
});

module.exports = router;
