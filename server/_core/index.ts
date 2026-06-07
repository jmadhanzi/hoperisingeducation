import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { stripe } from "../stripe";
import { getDb } from "../db";
import { donations, fundraisingGoals } from "../../drizzle/schema";
import { eq, sum, count } from "drizzle-orm";
import { notifyOwner } from "./notification";
import rateLimit from "express-rate-limit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ── Helper: format cents as a readable dollar string ─────────────────────────
function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// ── Helper: fetch live campaign totals for the notification ──────────────────
async function getCampaignSummary(): Promise<{
  raisedCents: number;
  donorCount: number;
  goalCents: number;
  percentComplete: number;
  campaignTitle: string;
}> {
  const db = await getDb();
  if (!db) {
    return { raisedCents: 0, donorCount: 0, goalCents: 1_000_000, percentComplete: 0, campaignTitle: "Annual Education Fund 2026" };
  }

  const [agg] = await db
    .select({ totalCents: sum(donations.amountCents), donors: count(donations.id) })
    .from(donations)
    .where(eq(donations.status, "completed"));

  const [activeGoal] = await db
    .select()
    .from(fundraisingGoals)
    .where(eq(fundraisingGoals.isActive, true))
    .limit(1);

  const raisedCents = Number(agg?.totalCents ?? 0);
  const donorCount = Number(agg?.donors ?? 0);
  const goalCents = activeGoal?.goalCents ?? 1_000_000;
  const percentComplete = goalCents > 0 ? Math.min(100, Math.round((raisedCents / goalCents) * 100)) : 0;
  const campaignTitle = activeGoal?.title ?? "Annual Education Fund 2026";

  return { raisedCents, donorCount, goalCents, percentComplete, campaignTitle };
}

// ── Helper: build a rich donation notification ───────────────────────────────
async function buildDonationNotification(session: {
  id: string;
  payment_intent?: string;
  metadata?: Record<string, string>;
  customer_email?: string;
  amount_total?: number;
}): Promise<{ title: string; content: string }> {
  const amountCents = session.amount_total ?? 0;
  const amountFormatted = formatAmount(amountCents);
  const donorName = session.metadata?.customer_name || "Anonymous Donor";
  const donorEmail = session.metadata?.customer_email || session.customer_email || "not provided";
  const isRecurring = session.metadata?.is_recurring === "true";
  const donorMessage = session.metadata?.message?.trim() || null;
  const frequency = isRecurring ? "Monthly Recurring" : "One-Time";

  const { raisedCents, donorCount, goalCents, percentComplete, campaignTitle } =
    await getCampaignSummary();

  const title = `🎉 New ${frequency} Donation: ${amountFormatted} from ${donorName}`;

  const lines: string[] = [
    `A new donation has been successfully processed for Hope Rising Education.`,
    ``,
    `━━━ DONOR DETAILS ━━━`,
    `Name:       ${donorName}`,
    `Email:      ${donorEmail}`,
    `Amount:     ${amountFormatted} ${isRecurring ? "(monthly)" : "(one-time)"}`,
    ...(donorMessage ? [`Message:    "${donorMessage}"`] : []),
    ``,
    `━━━ CAMPAIGN PROGRESS ━━━`,
    `Campaign:   ${campaignTitle}`,
    `Total Raised: ${formatAmount(raisedCents)} of ${formatAmount(goalCents)} (${percentComplete}%)`,
    `Total Donors: ${donorCount.toLocaleString()}`,
    ``,
    `━━━ STRIPE REFERENCE ━━━`,
    `Session ID: ${session.id}`,
    ...(session.payment_intent ? [`Payment ID: ${session.payment_intent}`] : []),
    ``,
    `View all donations in your admin dashboard: /admin`,
  ];

  return { title, content: lines.join("\n") };
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Stripe Webhook ── MUST be registered BEFORE express.json()
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("[Webhook] STRIPE_WEBHOOK_SECRET not set");
        res.status(500).json({ error: "Webhook secret not configured" });
        return;
      }

      let event: ReturnType<typeof stripe.webhooks.constructEvent>;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error("[Webhook] Signature verification failed:", err);
        res.status(400).json({ error: "Webhook signature verification failed" });
        return;
      }

      // Test events — return verification response
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      try {
        const db = await getDb();

        // ── checkout.session.completed ─────────────────────────────────────
        if (event.type === "checkout.session.completed") {
          const session = event.data.object as {
            id: string;
            payment_intent?: string;
            metadata?: Record<string, string>;
            customer_email?: string;
            amount_total?: number;
          };

          // Update donation status in DB
          if (db) {
            await db
              .update(donations)
              .set({
                status: "completed",
                stripePaymentIntentId:
                  typeof session.payment_intent === "string" ? session.payment_intent : null,
              })
              .where(eq(donations.stripeSessionId, session.id));
          }

          // Send rich owner notification
          try {
            const { title, content } = await buildDonationNotification(session);
            const sent = await notifyOwner({ title, content });
            if (sent) {
              console.log(`[Webhook] Owner notified: ${title}`);
            } else {
              console.warn("[Webhook] Owner notification could not be delivered (service unavailable)");
            }
          } catch (notifyErr) {
            // Never let notification failure break the webhook response
            console.error("[Webhook] Failed to send owner notification:", notifyErr);
          }
        }

        // ── payment_intent.payment_failed ──────────────────────────────────
        if (event.type === "payment_intent.payment_failed") {
          const intent = event.data.object as {
            id: string;
            last_payment_error?: { message?: string };
            metadata?: Record<string, string>;
          };

          if (db) {
            await db
              .update(donations)
              .set({ status: "failed" })
              .where(eq(donations.stripePaymentIntentId, intent.id));
          }

          // Notify owner of the failure so they can follow up
          try {
            const failReason = intent.last_payment_error?.message ?? "Unknown reason";
            await notifyOwner({
              title: `⚠️ Donation Payment Failed`,
              content: [
                `A donation payment failed and could not be processed.`,
                ``,
                `━━━ DETAILS ━━━`,
                `Payment Intent: ${intent.id}`,
                `Failure Reason: ${failReason}`,
                ``,
                `The donor may need to retry with a different payment method.`,
                `View details in your admin dashboard: /admin`,
              ].join("\n"),
            });
          } catch (notifyErr) {
            console.error("[Webhook] Failed to send failure notification:", notifyErr);
          }
        }

        // ── charge.refunded ────────────────────────────────────────────────
        if (event.type === "charge.refunded") {
          const charge = event.data.object as {
            payment_intent?: string;
            amount_refunded?: number;
            billing_details?: { name?: string; email?: string };
          };

          if (db && typeof charge.payment_intent === "string") {
            await db
              .update(donations)
              .set({ status: "refunded" })
              .where(eq(donations.stripePaymentIntentId, charge.payment_intent));
          }

          // Notify owner of the refund
          try {
            const refundAmount = charge.amount_refunded ? formatAmount(charge.amount_refunded) : "unknown amount";
            const donorName = charge.billing_details?.name ?? "Unknown Donor";
            const donorEmail = charge.billing_details?.email ?? "not provided";

            await notifyOwner({
              title: `↩️ Donation Refunded: ${refundAmount} to ${donorName}`,
              content: [
                `A donation has been refunded.`,
                ``,
                `━━━ REFUND DETAILS ━━━`,
                `Donor Name:   ${donorName}`,
                `Donor Email:  ${donorEmail}`,
                `Amount:       ${refundAmount}`,
                `Payment ID:   ${charge.payment_intent ?? "N/A"}`,
                ``,
                `View your admin dashboard for updated totals: /admin`,
              ].join("\n"),
            });
          } catch (notifyErr) {
            console.error("[Webhook] Failed to send refund notification:", notifyErr);
          }
        }
      } catch (err) {
        console.error("[Webhook] Error processing event:", err);
      }

      res.json({ received: true });
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── Security headers ───────────────────────────────────────────────────────
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    // Allow Stripe and CDN resources in CSP
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' js.stripe.com",
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "font-src 'self' fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' api.stripe.com",
        "frame-src js.stripe.com hooks.stripe.com",
      ].join("; ")
    );
    next();
  });

  // ── Rate limiting ──────────────────────────────────────────────────────────
  // General API rate limit
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  });

  // Strict rate limit for checkout — prevents spam/abuse of Stripe sessions
  const checkoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip ?? "unknown",
    message: { error: "Too many checkout attempts. Please wait before trying again." },
  });

  app.use("/api/trpc", apiLimiter);
  // Apply strict limit specifically to the donation checkout mutation
  app.use("/api/trpc/donations.createCheckoutSession", checkoutLimiter);

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
