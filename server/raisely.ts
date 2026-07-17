/**
 * Restrict public donation redirects to supported Raisely-hosted HTTPS pages.
 * This prevents accidental configuration of an arbitrary or insecure URL.
 */
export function isRaiselyDonationUrl(value: string | null | undefined): value is string {
  if (!value || value.length > 1024) return false;

  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && (host === "raisely.com" || host.endsWith(".raisely.com"));
  } catch {
    return false;
  }
}

export function normalizeRaiselyDonationUrl(value: string | null | undefined): string | null {
  if (!isRaiselyDonationUrl(value)) return null;
  return value.trim();
}
