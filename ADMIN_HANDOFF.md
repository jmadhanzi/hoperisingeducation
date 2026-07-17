# Hope Rising Education: Administrator and Donation Handoff

## Overview

This implementation adds a secure, server-enforced administration workspace to the existing Hope Rising Education website. It preserves the site’s public design and existing historical reporting while allowing approved administrators to publish selected public content, marketing videos, announcements, and donation settings without source-code edits.

| Capability | Delivered behaviour |
|---|---|
| Administrator access | The `/admin` workspace remains protected by the existing managed sign-in flow and a server-side email allowlist. |
| Initial administrator | `clarakonono@gmail.com` is the default approved address. |
| Content publishing | Administrators can update Home, About, and Programs copy from the dashboard; public pages only render published values. |
| Video management | Administrators can upload MP4, WebM, or MOV marketing videos to managed storage, publish or unpublish them, feature one video, and remove public entries. |
| Announcements | Administrators can create, schedule, activate, and retire site announcements. |
| Registrants | Contact and volunteer submissions are stored in the protected database, searchable/filterable, and exportable to CSV. |
| Donations | Public donation actions use a validated, configurable Raisely destination. The website never processes or stores donor payment-card data. |

> **Important:** The online donation button intentionally remains unavailable until an official Raisely campaign or checkout URL has been saved in the dashboard. Until then, the public page provides the existing WhatsApp and bank-transfer alternatives.

## Secure administrator access

The application continues to use the existing managed sign-in system rather than adding a separate password store. The server promotes and permits an administrator only when the authenticated email matches the server-only `ADMIN_EMAILS` policy. Client-side route checks improve the experience, but the API also rejects any unapproved identity.

| Configuration | Example | Purpose |
|---|---|---|
| `ADMIN_EMAILS` | `clarakonono@gmail.com` | Approves one exact administrator email address. |
| Multiple addresses | `clarakonono@gmail.com,other.admin@example.org` | Approves a comma-separated set of exact addresses. |
| Organisation domain | `clarakonono@gmail.com,@hoperisingeducationglobal.org` | Approves the named address plus every email at the specified domain. Use this only after confirming the domain’s account-management policy. |

To grant the first administrator access, deploy the configuration, then sign in using `clarakonono@gmail.com` through the existing sign-in path and visit `/admin`. The account is promoted during the managed sign-in synchronization step; no visitor-facing self-registration or local password is introduced.

## Deployment checklist

Apply the migration and deploy the server with the existing production variables. The new tables are created by the repository’s existing database command.

| Step | Command or action |
|---|---|
| 1. Install dependencies | `pnpm install` |
| 2. Apply database migration | `pnpm db:push` |
| 3. Configure admin allowlist | Set `ADMIN_EMAILS=clarakonono@gmail.com` on the server. |
| 4. Confirm managed storage | Retain the existing `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` values so video uploads can be stored safely. |
| 5. Build and launch | `pnpm build` followed by `pnpm start` in the production environment. |
| 6. Sign in and open dashboard | Use the approved email, then visit `/admin`. |
| 7. Set donation destination | In **Donation settings**, save the official HTTPS Raisely campaign or checkout URL. |

## Dashboard workflows

### Publishing website content

Open **Website copy** in `/admin`, edit the required field, select the **Published** state, and save. The supported fields cover the Home hero and impact heading, the About introduction, the Programs hero and introduction, all six program descriptions, community-partnership copy, and the Programs donation call to action. Plain text is rendered safely on the public website; no administrator-entered HTML is executed.

### Uploading a marketing video

Open **Marketing video**, select an MP4, WebM, or MOV file, and finish the title, description, optional thumbnail URL, and publishing controls after upload. The current request-safe limit is **20 MB** per video; this conservative limit prevents large base64 request bodies from exhausting the application server. Videos are stored through the existing managed object-storage route rather than embedded in application source code.

### Publishing announcements

Open **Announcements** to add a title, body, optional call to action, activation status, and optional start/end schedule. Public visitors only receive announcements that are active and within their configured publication window.

### Reviewing and exporting registrants

The protected **Registrants** workspace includes contact and volunteer submissions. Filter by submission type or status, search the captured fields, and use the CSV export action for spreadsheet import. CSV cells that begin with spreadsheet formula characters are escaped before export to reduce formula-injection risk.

### Configuring Raisely donations

Open **Donation settings** and paste the official HTTPS Raisely campaign or checkout URL. The server validates the configured destination before exposing it to the public website, and the public Donate page redirects supporters to that validated URL. The same configuration is used by all active donation entry points, including the legacy compatibility endpoint, so the application cannot create a Stripe payment session.

Raisely’s own hosted donation form should remain responsible for collecting payment details and issuing applicable receipts. This keeps the Hope Rising application outside the payment-data path. Consult Raisely’s supported donation-form configuration guidance when choosing the campaign destination or a future official embed.[1]

## Privacy and operational notes

The Privacy and Terms pages now describe the Raisely-hosted donation path rather than the retired local Stripe checkout. Historical donation records and fundraising statistics remain readable for reporting purposes, but new public donation actions do not create Stripe checkout sessions. The existing Stripe webhook path remains only for historical reconciliation; remove its credentials and webhook integration only after confirming that no historical events still need to be processed.

## Validation completed

The implementation passed the final automated and build validation.

| Check | Result |
|---|---|
| TypeScript validation | Passed with `pnpm check`. |
| Automated tests | Passed: 26 tests across the administrator, authentication, and donation suites. |
| Production build | Passed with `pnpm build`. |
| Browser QA | Confirmed the Donate page’s explicit no-campaign fallback: it displays **Online checkout coming soon** and preserves WhatsApp and bank-transfer alternatives. |
| Diff hygiene | Passed with `git diff --check`. |

The build emitted only non-blocking notices for unset optional analytics placeholders in `index.html`; these do not prevent the application from compiling or running.

## Remaining administrator action

The sole required configuration still outstanding is the official Raisely campaign or checkout URL. Once you receive it, enter it in `/admin` under **Donation settings**, save, and the Donate page will enable the secure hosted-checkout button without another code deployment.

## References

[1]: https://support.raisely.com/hc/en-us/articles/44649204657293-Forms-Setting-Up-Donation-Form "Raisely Support: Forms — Setting Up Donation Form"
