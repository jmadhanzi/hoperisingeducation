
## Stripe Payment Integration

- [x] Add donations table to drizzle schema (stripe_payment_intent_id, amount_cents, currency, donor_name, donor_email, message, is_recurring, status)
- [x] Run pnpm db:push to migrate schema
- [x] Create server/stripe.ts with Stripe client and product definitions
- [x] Create server/routers/donations.ts with createCheckoutSession and listDonations procedures
- [x] Register Stripe webhook at /api/stripe/webhook in server/_core/index.ts
- [x] Update Donate page with real Stripe checkout flow (giving levels, one-time/monthly, custom amount)
- [x] Add donation success and cancelled confirmation pages
- [x] Write vitest tests for donation procedures (7 tests, all passing)
- [x] Checkpoint and push to GitHub

## Dynamic Fundraising Progress Bar

- [x] Add fundraisingGoals table to schema (title, goal_cents, raised_cents, deadline, is_active)
- [x] Run pnpm db:push to migrate
- [x] Add getFundraisingStats tRPC procedure (sum completed donations, goal config)
- [x] Add auto-refresh via tRPC query polling (every 30s) so bar updates without page reload
- [x] Build FundraisingProgress component (animated bar, donor count, days left, milestone badges)
- [x] Embed component prominently on Donate page above the form
- [x] Write vitest tests for the stats procedure
- [x] Checkpoint and push to GitHub

## Admin Dashboard

- [x] Add adminProcedure guard (role === 'admin') to tRPC router
- [x] Add admin.recentDonors procedure (last 50 donations with donor info, amount, status, date)
- [x] Add admin.updateCampaignGoal procedure (update goalCents and deadline on fundraisingGoals)
- [x] Add admin.campaignStats procedure (total raised, donor count, active campaign details)
- [x] Build /admin route with role-gated access (redirect non-admins to home)
- [x] Build AdminDashboard page: stats cards, recent donors table, campaign goal editor form
- [x] Register /admin route in App.tsx
- [x] Write vitest tests for admin procedures
- [x] Checkpoint and push to GitHub

## Rich Donation Notifications

- [x] Upgrade checkout.session.completed notification with donor name, email, amount, frequency, message
- [x] Include live campaign totals (total raised, donor count, goal %, campaign title) in notification
- [x] Add payment_intent.payment_failed notification with failure reason
- [x] Add charge.refunded notification with refund amount and donor details
- [x] Wrap all notifyOwner calls in try/catch so failures never break webhook response
- [x] Add formatAmount() and getCampaignSummary() helpers to server/_core/index.ts
- [x] All 23 vitest tests pass after upgrade
- [x] Checkpoint and push to GitHub

## My Donations Page (/my-donations)

- [x] Add myDonations tRPC procedure (already exists — verify it returns all needed fields)
- [x] Build MyDonations page: protected, redirects to login if unauthenticated
- [x] Show summary header: total donated, donation count, monthly vs one-time breakdown
- [x] Show sortable/filterable donations table: date, amount, frequency, status badge, message preview
- [x] Show empty state when user has no donations yet with CTA to Donate page
- [x] Add "My Donations" link to Navbar for logged-in users (desktop + mobile)
- [x] Register /my-donations route in App.tsx
- [x] Write vitest tests for myDonations procedure (success path + auth guard)
- [x] Checkpoint and push to GitHub

## Blog / Impact Stories Feature

- [x] Add blogPosts table to drizzle/schema.ts (id, title, slug, excerpt, content, coverImageUrl, category, author, published, publishedAt, createdAt, updatedAt)
- [x] Run pnpm db:push to migrate schema
- [x] Add blog tRPC procedures: list (public), getBySlug (public), create (admin), update (admin), delete (admin)
- [x] Build public /blog listing page: card grid, category filter, search, hero
- [x] Build public /blog/:slug post detail page: cover image, rich content, author, date, back link
- [x] Build admin blog management UI in AdminDashboard: list posts, create/edit form, publish toggle, delete
- [x] Add Blog link to Navbar and Footer Quick Links
- [x] Seed 3 sample impact story posts via SQL
- [x] Write vitest tests for blog procedures
- [x] Checkpoint and push to GitHub

## Admin Media Library & Site Content Editor

- [x] Add mediaFiles table to drizzle/schema.ts (id, key, url, filename, mimeType, size, altText, uploadedBy, createdAt)
- [x] Add siteContent table to drizzle/schema.ts (id, key, value, label, type, updatedAt)
- [x] Run pnpm db:push to migrate schema
- [x] Build media tRPC procedures: upload (admin), list (admin), delete (admin), updateAlt (admin)
- [x] Build siteContent tRPC procedures: getAll (public), upsert (admin)
- [x] Build AdminMedia page: drag-drop upload, grid preview, copy URL, delete, alt text edit
- [x] Build AdminContent page: editable fields for hero, mission, stats, programs, contact info
- [x] Add Media Library and Site Content links to AdminDashboard top bar
- [x] Seed default siteContent rows for all editable fields
- [x] Wire siteContent to Home, About, Programs pages so edits appear live
- [x] Write vitest tests for media and siteContent procedures
- [x] Checkpoint and push to GitHub
