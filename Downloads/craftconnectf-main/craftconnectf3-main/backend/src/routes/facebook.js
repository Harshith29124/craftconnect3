require("dotenv").config();

const express = require("express");
const axios = require("axios");
const router = express.Router();

// Env
const PAGE_ID = process.env.FB_PAGE_ID || process.env.PAGE_ID;
const PAGE_ACCESS_TOKEN =
  process.env.FB_PAGE_ACCESS_TOKEN || process.env.PAGE_ACCESS_TOKEN;
const GRAPH_VER = process.env.FB_GRAPH_VERSION || "v24.0";

if (!PAGE_ID || !PAGE_ACCESS_TOKEN) {
  // Do not crash server; log warning so other routes still work
  console.warn(
    "[facebook] Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN. /api/facebook routes will return 503."
  );
}

const fb = axios.create({
  baseURL: `https://graph.facebook.com/${GRAPH_VER}`,
  timeout: 15000,
});

function normalizeFbError(err) {
  if (err.response?.data?.error) {
    const e = err.response.data.error;
    const code = e.code;
    const sub = e.error_subcode;
    const msg = e.message;
    if (code === 200)
      return "Permission error (200): token must be a PAGE token with pages_manage_posts + pages_read_engagement and you must be Page admin.";
    if (code === 100) {
      if (/parameter.*required/i.test(msg))
        return "Missing required parameter (message for /feed, url for /photos).";
      if (/Unsupported post request/i.test(msg))
        return "Wrong ID/endpoint. Use PAGE_ID and POST to /{PAGE_ID}/feed or /{PAGE_ID}/photos.";
    }
    return `Facebook API error ${code}${sub ? "/" + sub : ""}: ${msg}`;
  }
  if (err.code === "ECONNABORTED") return "Network timeout to Facebook API.";
  return "Unknown error contacting Facebook API.";
}

async function retry(fn, { retries = 2, delayMs = 500 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

// Health
router.get("/health", (req, res) => {
  if (!PAGE_ID || !PAGE_ACCESS_TOKEN)
    return res
      .status(503)
      .json({ ok: false, error: "Facebook not configured" });
  res.json({ ok: true, page: PAGE_ID, graph: GRAPH_VER });
});

// Internal helper to fetch session from our backend (no frontend trust)
async function getSession(sessionId) {
  const baseUrl =
    process.env.INTERNAL_BASE_URL ||
    `http://localhost:${process.env.PORT || 8080}`;
  const r = await axios.get(`${baseUrl}/api/session/${sessionId}`);
  return r.data.session || r.data; // support both shapes
}

function buildMessageFromSession(session) {
  const name =
    session?.productAnalysis?.productSummary?.name ||
    session?.businessSummary?.businessName ||
    "Our craft";
  const features =
    session?.productAnalysis?.productSummary?.uniqueFeatures || [];
  const selling =
    session?.productAnalysis?.marketingInsights?.sellingPoints || [];
  const bullets = [...features, ...selling]
    .slice(0, 3)
    .map((s) => `• ${s}`)
    .join("\n");
  const priceText =
    session?.product?.price ||
    session?.productAnalysis?.marketingInsights?.pricingRange ||
    "";
  return `${name}\n\n${bullets}\n\n${
    priceText ? `Price: ${priceText}` : ""
  }`.trim();
}

function extractImageUrls(session) {
  if (Array.isArray(session?.imageUrls)) return session.imageUrls;
  if (Array.isArray(session?.productImages)) return session.productImages;
  return [];
}

// Post text using sessionId
router.post("/post-text-from-session", async (req, res) => {
  try {
    if (!PAGE_ID || !PAGE_ACCESS_TOKEN)
      return res
        .status(503)
        .json({ ok: false, error: "Facebook not configured" });
    const { sessionId } = req.body || {};
    if (!sessionId)
      return res
        .status(400)
        .json({ ok: false, error: "sessionId is required" });

    const session = await getSession(sessionId);
    const message = buildMessageFromSession(session);

    const params = new URLSearchParams();
    params.append("message", message);
    params.append("access_token", PAGE_ACCESS_TOKEN);

    const out = await retry(() =>
      fb.post(`/${PAGE_ID}/feed`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
    );
    res.json({ ok: true, postId: out.data.id });
  } catch (e) {
    res.status(400).json({ ok: false, error: normalizeFbError(e) });
  }
});

// Post photo(s) using sessionId (posts first image + caption)
router.post("/post-photo-from-session", async (req, res) => {
  try {
    if (!PAGE_ID || !PAGE_ACCESS_TOKEN)
      return res
        .status(503)
        .json({ ok: false, error: "Facebook not configured" });
    const { sessionId } = req.body || {};
    if (!sessionId)
      return res
        .status(400)
        .json({ ok: false, error: "sessionId is required" });

    const session = await getSession(sessionId);
    const images = extractImageUrls(session);
    if (!images.length)
      return res
        .status(400)
        .json({ ok: false, error: "No images available in session" });
    const caption = buildMessageFromSession(session);

    const params = new URLSearchParams();
    params.append("url", images[0]);
    params.append("caption", caption);
    params.append("access_token", PAGE_ACCESS_TOKEN);

    const out = await retry(() =>
      fb.post(`/${PAGE_ID}/photos`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
    );
    res.json({
      ok: true,
      photoId: out.data.id,
      postId: out.data.post_id ?? null,
    });
  } catch (e) {
    res.status(400).json({ ok: false, error: normalizeFbError(e) });
  }
});

module.exports = router;
