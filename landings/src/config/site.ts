/**
 * Landing configuration that is not copy.
 *
 * `gaMeasurementId` is the GA4 measurement id (G-XXXXXXXXXX) for sneat.club. It
 * is read from `PUBLIC_GA4_MEASUREMENT_ID` at build time and defaults to empty,
 * so analytics stays OFF until an id is supplied: @sneat/astro's
 * GoogleAnalytics renders nothing at all without one, which is why this wiring
 * can land before the GA4 property exists.
 *
 * Supply the id either as a build-time environment variable (CI / Cloudflare)
 * or by committing it here as the default.
 */
export const gaMeasurementId: string = import.meta.env.PUBLIC_GA4_MEASUREMENT_ID ?? "G-MCQZZ3JHZK";
