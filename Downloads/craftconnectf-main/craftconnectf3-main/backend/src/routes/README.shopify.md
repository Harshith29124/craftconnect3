# Shopify Integration

The production Shopify integration exposes routes under `/api/shopify` and never trusts frontend product data. It publishes products using server-side session data created earlier in the flow (speech-to-text, image and product analysis).

## Endpoints

- `GET /api/shopify/health`
  - Quick health check for store, API version, and optional inventory location.

- `GET /api/shopify/products`
  - Lists products from your Shopify store (useful for smoke-testing credentials).

- `POST /api/shopify/publish-from-session`
  - Publishes a product to Shopify using data from an internal session.
  - Request body:
    ```json
    {
      "sessionId": "<BusinessSession _id>",
      "artisanId": "rekha",        // optional -> stored as tag artisan:rekha
      "quantity": 10                // optional -> default 10 if LOCATION_ID is set
    }
    ```
  - The route fetches session JSON from your own backend via `GET /api/session/:sessionId` and derives:
    - title: `productAnalysis.productSummary.name` (fallback businessSummary.businessName)
    - descriptionHtml: built from productSummary fields (materials, uniqueFeatures, etc.)
    - price: numeric field if present, otherwise first number parsed from `marketingInsights.pricingRange`, falling back to 299
    - images: existing stored URLs in `session.imageUrls` or `session.productImages`

## Environment Variables

- `SHOPIFY_STORE_DOMAIN` (required) e.g. `craft-connect-demo1.myshopify.com`
- `SHOPIFY_ADMIN_TOKEN` (required) Admin API token (starts with `shpat_`)
- `SHOPIFY_API_VERSION` (optional, default `2025-10`)
- `LOCATION_ID` (optional but recommended) for auto inventory set
- `INTERNAL_BASE_URL` (optional) base URL of this backend, default `http://localhost:8080`

## How it works

1. The route pulls session data from `GET /api/session/:sessionId` so this service does not couple to DB models.
2. It constructs the Shopify product payload and creates the product via Admin API.
3. If `LOCATION_ID` is present, it enables variant inventory tracking and sets quantities.

## Notes

- Keep your existing testing service if you like. This integration is production-mounted in `backend/server.js` at `/api/shopify`.
- Ensure your session API returns a `session` object or top-level fields compatible with this mapping.
