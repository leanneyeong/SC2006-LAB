import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { HDBDataService } from "../services/hdb-data-service";
import { carParkRepository } from "../repositories";
import { z } from "zod";

// Direct import of the service file
import { CarParkService } from "../services/car-park-service";

// Import necessary repositories
// Adjust these imports based on your project structure
import { userReviewRepository } from "../repositories/user-review-repository";
import { userFavouriteRepository } from "../repositories/user-favourite-repository";

// Create a new instance of CarParkService
const carParkService = new CarParkService(
    carParkRepository,
    userFavouriteRepository,
    userReviewRepository
);

// Save direct references to the methods to avoid any TypeScript issues
const setFavouriteMethod = carParkService.setFavourite.bind(carParkService);
const createReviewMethod = carParkService.createReview.bind(carParkService);
const updateReviewMethod = carParkService.updateReview.bind(carParkService);
const deleteReviewMethod = carParkService.deleteReview.bind(carParkService);

export const carParkRouter = createTRPCRouter({
    getCarparks: protectedProcedure
        .input(z.object({
            x: z.number(),
             y: z.number()

        }))
        .query(async ({input,ctx}) => {
            const carparks = await carParkRepository.findNearby({x:input.x,y:input.y}, ctx.auth.userId)
            return carparks;
        }),
        
    refreshAvailability: protectedProcedure
        .mutation(async () => {
            const hdbDataService = new HDBDataService();
            await hdbDataService.processData();
            return { success: true };
        }),
        
    // Using the direct method reference
    setFavourite: protectedProcedure
        .input(z.object({
            id: z.string(),
            isFavourited: z.boolean()
        }))
        .mutation(async ({input, ctx}) => {
            return await setFavouriteMethod(
                ctx.auth.userId,
                input.id,
                input.isFavourited
            );
        }),
        
    // Using the direct method reference for submitting a review
    review: protectedProcedure
        .input(z.object({
            id: z.string(),
            rating: z.number().min(1).max(5),
            description: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            return await createReviewMethod(
                ctx.auth.userId,
                input.id,
                input.rating,
                input.description
            );
        }),
        
    // Get reviews for a carpark
    getReviews: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async ({input}) => {
            return await userReviewRepository.findManyByCarParkId(input.id);
        }),
        
    // Update an existing review
    updateReview: protectedProcedure
        .input(z.object({
            id: z.string(),
            rating: z.number().min(1).max(5),
            description: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            return await updateReviewMethod(
                ctx.auth.userId,
                input.id,
                input.rating,
                input.description
            );
        }),
        
    // Delete a review
    deleteReview: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({input, ctx}) => {
            return await deleteReviewMethod(
                ctx.auth.userId,
                input.id
            );
        })
});