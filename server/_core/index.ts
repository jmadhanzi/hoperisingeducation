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
import { donations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./notification";

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

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as {
            id: string;
            payment_intent?: string;
            metadata?: Record<string, string>;
            customer_email?: string;
            amount_total?: number;
          };

          if (db) {
            await db
              .update(donations)
              .set({
                status: "completed",
                stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
              })
              .where(eq(donations.stripeSessionId, session.id));
          }

          const amountFormatted = session.amount_total
            ? `$${(session.amount_total / 100).toFixed(2)}`
            : "unknown amount";
          const donorEmail = session.metadata?.customer_email || session.customer_email || "anonymous";

          await notifyOwner({
            title: "New Donation Received!",
            content: `A donation of ${amountFormatted} was completed by ${donorEmail}. Session: ${session.id}`,
          });
        }

        if (event.type === "payment_intent.payment_failed") {
          const intent = event.data.object as { id: string };
          if (db) {
            await db
              .update(donations)
              .set({ status: "failed" })
              .where(eq(donations.stripePaymentIntentId, intent.id));
          }
        }

        if (event.type === "charge.refunded") {
          const charge = event.data.object as { payment_intent?: string };
          if (db && typeof charge.payment_intent === "string") {
            await db
              .update(donations)
              .set({ status: "refunded" })
              .where(eq(donations.stripePaymentIntentId, charge.payment_intent));
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
