import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { donationsRouter } from "./routers/donations";
import { adminRouter } from "./routers/admin";
import { contactRouter } from "./routers/contact";
import { contentRouter } from "./routers/content";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  donations: donationsRouter,
  admin: adminRouter,
  contact: contactRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
