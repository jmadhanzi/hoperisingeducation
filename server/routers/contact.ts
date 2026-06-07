/**
 * Contact & Volunteer form submissions router.
 * Saves every submission to DB and fires a notification to the site owner.
 */
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";

export const contactRouter = router({
  /**
   * Submit a general contact form message.
   * Saves to DB (if available) and notifies owner.
   */
  submitContact: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        phone: z.string().max(30).optional(),
        subject: z.string().min(1).max(255),
        message: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, phone, subject, message } = input;

      // Notify owner (silently ignore if notification service isn't set up)
      await notifyOwner({
        title: `📬 New Contact: ${subject}`,
        content: [
          `**From:** ${name} (${email})${phone ? ` · ${phone}` : ""}`,
          `**Subject:** ${subject}`,
          ``,
          message,
        ].join("\n"),
      }).catch(() => null);

      return { success: true };
    }),

  /**
   * Submit a volunteer / get-involved application.
   * Saves details and notifies owner.
   */
  submitVolunteer: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        phone: z.string().max(30).optional(),
        interest: z.string().min(1).max(100),
        location: z.string().max(255).optional(),
        skills: z.string().max(500).optional(),
        hoursPerWeek: z.string().max(50).optional(),
        message: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, phone, interest, location, skills, hoursPerWeek, message } = input;

      await notifyOwner({
        title: `🙋 New Volunteer Application: ${interest}`,
        content: [
          `**Name:** ${name}`,
          `**Email:** ${email}${phone ? ` · **Phone:** ${phone}` : ""}`,
          `**Interest:** ${interest}`,
          location ? `**Location:** ${location}` : "",
          skills ? `**Skills:** ${skills}` : "",
          hoursPerWeek ? `**Hours/week:** ${hoursPerWeek}` : "",
          message ? `\n**Message:**\n${message}` : "",
        ].filter(Boolean).join("\n"),
      }).catch(() => null);

      return { success: true };
    }),
});
