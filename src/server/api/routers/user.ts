import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { userService } from "../services";

export const userRouter = createTRPCRouter({
    get: protectedProcedure
    .query(async({ctx})=>{
        return await userService.getUserDetails(ctx.auth.userId)
    }),
    updateNameDetails: protectedProcedure
    .input(z.object({
        firstName: z.string(),
        lastName: z.string()
    }))
    .mutation(async ({ctx ,input}) => {
        return await userService.updateNameDetails(
            ctx.auth.userId,
            input.firstName,
            input.lastName
        )
    }),
    updatePassword: protectedProcedure
    .input(z.object({
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[a-z]/, "Password must contain at least one lowercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z.string()
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // This specifies which field the error is associated with
      }))
    .mutation(async ({ctx, input}) =>{
        return await userService.updatePassword(
            ctx.auth.userId,
            input.password
        )
    })
});

