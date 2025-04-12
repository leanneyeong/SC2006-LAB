import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { userService } from "../services";
import UserDetails from "../types/user-details";

export const userRouter = createTRPCRouter({
    getFavouriteCarParks: protectedProcedure
    .query(async ({ctx}) => await userService.getFavouriteCarParks(ctx.auth.userId)),
    updateNames: protectedProcedure
    .input(z.object({
        firstName: z.string(),
        lastName: z.string()
    }))
    .mutation(async ({ctx,input}) => await userService.updateNames(
        ctx.auth.userId,
        input.firstName,
        input.lastName
    )),
    updateMainSettings: protectedProcedure
    .input(z.object({
        isNotificationsEnabled:z.boolean(),
        isDarkMode: z.boolean()
    }))
    .mutation(async ({ctx,input}) => await userService.updateMainSettings(
        ctx.auth.userId,
        input.isDarkMode
    )),
    setHomeCarPark: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({ctx}) => await userService.deleteUser(ctx.auth.userId)),
    get: protectedProcedure
    .query(async ({ctx}): Promise<UserDetails> => await userService.getUser(ctx.auth.userId)),
    updatePassword: protectedProcedure
    .input(z.object({
        password: z.string(),
    }))
    .mutation(async ({ctx,input}) => await userService.updatePassword(
        ctx.auth.userId,
        input.password
    ))
});

