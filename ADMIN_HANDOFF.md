# Hope Rising Education — Admin Handoff Guide

> **Admin login:** Go to `https://your-site.manus.space/admin` and sign in with your Manus account. Your account (`clarakonono@gmail.com`) must have the `admin` role in the database. If you are locked out, contact the developer to run: `UPDATE user SET role = 'admin' WHERE email = 'clarakonono@gmail.com';`

---

## 1. Announcements

**URL:** `/admin/announcements`

Announcements appear as a dismissable orange banner at the very top of every page on the public site. Visitors can dismiss the banner; it will not reappear until they clear their browser's local storage.

### Creating an Announcement

1. Click **New Announcement**.
2. Fill in the **Title** (shown in bold in the banner) and **Body** (the full message text).
3. The body supports basic HTML: `<b>bold</b>`, `<a href="...">links</a>`, `<br>` for line breaks.
4. Optionally set a **Publish At** date/time (the banner will not appear before this time) and an **Unpublish At** date/time (the banner will disappear automatically after this time).
5. Make sure the **Active** toggle is on.
6. Click **Create**.

### Status Labels

| Label | Meaning |
|---|---|
| **Live** | Visible to all visitors right now |
| **Scheduled** | Active but `publishAt` is in the future |
| **Expired** | Active but `unpublishAt` has passed |
| **Inactive** | Toggle is off — never shown |

### Editing or Deleting

Click the pencil icon to edit, or the trash icon to permanently delete. Deletions are immediate and cannot be undone.

---

## 2. Marketing Videos

**URL:** `/admin/videos`

Videos uploaded here are stored in the site's built-in cloud storage (up to 200 MB per file). Published videos can be displayed on the public site.

### Uploading a Video

1. Drag and drop a video file onto the upload zone, or click to browse.
2. Supported formats: **MP4, WebM, MOV** — maximum **200 MB**.
3. Fill in the **Title** (required) and optionally a **Description** and **Poster/Thumbnail URL**.
4. Click **Upload Video**. A progress bar shows the upload status.
5. The video is saved as a **Draft** (not published) by default.

### Publishing a Video

Toggle the **eye switch** next to any video to publish or unpublish it. Published videos are available to the public site.

### Reordering Videos

Use the **▲ / ▼ arrows** on the left side of each video card to change the display order.

### Editing Metadata

Click the pencil icon to update the title, description, or thumbnail URL.

### Deleting a Video

Click the trash icon and confirm. This removes the video from the database. The underlying storage file is effectively inaccessible once the record is deleted.

---

## 3. Registrant Data Export

**URL:** `/admin/registrants`

Every person who submits the **Get Involved** form on the public site is automatically saved here.

### Viewing Registrants

The table shows name, email, phone, interest area, message, and submission date. Use the **Search** box to filter by name or email, and the **From/To Date** pickers to narrow by date range.

### Exporting to CSV

1. Apply any filters you want (or leave blank for all records).
2. Click **Export CSV**.
3. A UTF-8 CSV file is downloaded to your computer, named `registrants-YYYY-MM-DD.csv`.
4. Open in Excel, Google Sheets, or any spreadsheet app.

The CSV includes: ID, Name, Email, Phone, Interest, Message, Source, Date.

---

## 4. Raisely Donation Integration

The Donate page (`/donate`) includes a **Raisely embed section** below the Stripe donation form. When a visitor scrolls down, they see your Raisely campaign in an iframe.

### Setting Your Raisely Campaign URL

1. Go to `/admin/content` (Site Content Editor).
2. Scroll to the **Donations** section.
3. Update the **Raisely Campaign URL** field with your real Raisely campaign URL, e.g.:
   ```
   https://donate.raisely.com/your-campaign-name
   ```
4. Click **Save Changes**.
5. The embed on the Donate page will immediately use the new URL.

### Disabling the Raisely Embed

1. Go to `/admin/content` → **Donations** section.
2. Set **Show Raisely Embed on Donate Page** to `false`.
3. Save. The embed section will disappear from the public Donate page.

### Raisely Dashboard Settings (Manual Steps)

These settings must be configured directly in your [Raisely Dashboard](https://app.raisely.com):

| Setting | Recommended Value |
|---|---|
| **Campaign name** | Hope Rising Education |
| **Currency** | USD (or ZWL if preferred) |
| **Goal amount** | Match the goal shown on the site's fundraising bar |
| **Thank-you email** | Enable and customise with your branding |
| **Receipt email** | Enable for tax compliance |
| **Embed allowed domains** | Add your site domain (e.g. `hoperisingeducation.manus.space`) |
| **Custom CSS** | Optional — match brand colours `#0D215C` (navy) and `#EE701E` (orange) |

> **Important:** Raisely requires you to whitelist the domains that are allowed to embed your campaign. Go to **Campaign Settings → Embed → Allowed Domains** and add your published site URL. Without this, the iframe will show a blank page.

---

## 5. Blog Manager

**URL:** `/admin/blog`

Create and edit impact stories. Each post has a title, slug, excerpt, full content (Markdown), cover image, category, and published/draft status.

- Use the **Media Library** (`/admin/media`) to upload cover images and copy their URLs into the Cover Image URL field.
- Posts are only visible on the public `/blog` page when **Published** is toggled on.

---

## 6. Site Content Editor

**URL:** `/admin/content`

Edit all text content that appears on the public site without touching code: hero headline, mission statement, stats, program descriptions, contact info, and the Raisely URL.

Changes take effect **immediately** on save.

---

## 7. Stripe Payments

Test card: `4242 4242 4242 4242` (any future expiry, any CVV).

Once you are ready to go live:
1. Claim your Stripe sandbox at the link provided when Stripe was set up.
2. Complete Stripe KYC verification to receive live keys.
3. Go to **Settings → Payment** in the Manus Management UI and enter your live `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`.

---

## 8. Publishing the Site

After any changes, click the **Publish** button in the top-right of the Manus Management UI to deploy the latest version live.

---

*Last updated: July 2025*
