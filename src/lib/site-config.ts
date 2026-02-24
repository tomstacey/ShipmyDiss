/**
 * Site-wide feature flags.
 *
 * BETA_MODE — toggle via Vercel env var without a code deploy:
 *   NEXT_PUBLIC_BETA_MODE=false → landing page shows paid pricing (£4.99/mo, £29.99/year)
 *   (any other value or absent) → landing page shows "Free during beta" messaging (default)
 *
 * Default is beta mode (free) — explicitly set to "false" to switch to paid pricing.
 */
export const BETA_MODE = process.env.NEXT_PUBLIC_BETA_MODE !== "false";
