import { ENV } from "./_core/env";

/**
 * Parses the administrator allowlist from a server-only environment variable.
 * Entries may be exact email addresses or domains prefixed with "@".
 */
function getApprovedAdministratorEntries(): string[] {
  return ENV.adminEmails
    .split(",")
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns true only when an email matches an explicit approved address or
 * an explicitly approved organisation domain such as "@hoperising.org".
 */
export function isApprovedAdministratorEmail(email: string | null | undefined): boolean {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) return false;

  return getApprovedAdministratorEntries().some(entry => {
    if (entry.startsWith("@")) {
      return normalizedEmail.endsWith(entry);
    }
    return normalizedEmail === entry;
  });
}

export function approvedAdministratorLabel(): string {
  const entries = getApprovedAdministratorEntries();
  return entries.length > 0 ? entries.join(", ") : "the configured organisation administrator";
}
