
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
