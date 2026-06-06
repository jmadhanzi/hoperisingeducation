
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
