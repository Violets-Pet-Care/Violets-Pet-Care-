# Violet's Pet Care secure quote + Square backend

This backend is separate from GitHub Pages and does not use Netlify. It is designed for Cloudflare Workers + D1.

## Important before production
- This is an API scaffold. It is not deployed and has not been connected to your Cloudflare or Square accounts.
- Start in Square Sandbox. Never paste access tokens into GitHub, HTML/JS, or chat.
- The public request endpoint is intentionally request-only. It cannot create a payment link.
- Only an admin request authenticated with ADMIN_API_KEY can approve a pending request and create a Square link.
- Do not make your existing demo-login admin dashboard public for real customer data. Its demo login is not suitable for production; use the API key only in a private admin workflow or implement real user authentication before exposing admin data.
- The backend stores customer contact details and pet-care notes. Keep those fields limited to what is needed, restrict admin access, and define a retention/deletion routine.

## 1. Create Cloudflare resources
1. Sign in to Cloudflare and open Workers & Pages.
2. Create a D1 database named `violets-pet-care`.
3. Open its Console and run `schema.sql`.
4. Create a Worker named `violets-pet-care-api` and paste `worker.js`.
5. Add a D1 binding named `DB` pointing to that database.
6. Add secrets in Worker Settings > Variables and Secrets:
   - `SQUARE_ACCESS_TOKEN` — use a Square Sandbox access token for testing
   - `SQUARE_LOCATION_ID` — the matching Square Sandbox location ID
   - `ADMIN_API_KEY` — a long random secret (at least 32 random bytes)
   - `SQUARE_ENVIRONMENT` — text variable `sandbox` for testing; change to `production` only after successful tests
7. Deploy and copy the Worker URL, e.g. `https://violets-pet-care-api.<your-subdomain>.workers.dev`.

Cloudflare Workers Free currently includes 100,000 requests/day; D1 has a free tier. Check current limits before relying on it for business-critical traffic.

## 2. API routes
- `POST /api/quote`: calculates a server-side estimate.
- `POST /api/requests`: saves a pending request and server-calculated estimate. Never charges.
- `GET /api/admin/requests`: lists requests; requires `Authorization: Bearer ADMIN_API_KEY`.
- `POST /api/admin/requests/{id}/approve`: approves a pending request and creates a Square payment link for the approved cents. Optional body: `{"approvedCents":7000}`. If omitted, uses the server-calculated quote. This route is admin-secret protected.
- `PATCH /api/admin/requests`: decline/cancel a pending request; requires admin secret.

All monetary values are integer cents. The browser's submitted total is ignored; the server calculates from service selection and quantities.

## 3. Pricing currently encoded
- 30-minute visit: $45
- 60-minute visit: $80
- Additional dog: $10; additional cat: $5
- Litter box: $15 per box per visit
- Photo updates: $5 per pet per visit
- Medication: $10 per pet per visit
- Optional tip: 0%, 10%, 15%, or 20%
- Discounts: 5% off additional-dog charges for 3+ dogs; 3% off additional-cat charges for 3+ cats.

Verify that this discount rule matches your final policy before production. The backend intentionally uses cents and recalculates on the server.

## 4. Test in Sandbox first
Use Square's Sandbox Developer Dashboard. Test:
- quote calculation for one pet and multiple visits
- add-ons and discount boundaries
- pending request creation
- unauthenticated admin calls return 401
- approval creates a sandbox Square checkout link for the exact approved amount
- repeated approval is rejected
- production is not enabled until all tests pass

## 5. Still needed for full integration
- Add the Worker URL to the website as a public API base URL (not a secret).
- Update the intake/quote form to POST its fields to `/api/requests` and `/api/quote`.
- Build a secure admin approval screen with proper authentication. Do not reuse the current demo-login screen for real customer records.
- Configure Square payment webhooks or reconcile payments in Square Dashboard before automatically marking requests as paid.
- Send customers the link by email/SMS after approval; link creation alone does not send it.
