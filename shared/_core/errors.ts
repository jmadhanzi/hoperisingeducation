import { TRPCError } from "@trpc/server";

export function ForbiddenError(message: string): TRPCError {
  return new TRPCError({ code: "FORBIDDEN", message });
}

export function UnauthorizedError(message: string): TRPCError {
  return new TRPCError({ code: "UNAUTHORIZED", message });
}
