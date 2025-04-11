import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { HDBDataService } from "../services/hdb-data-service";
import { carParkRepository } from "../repositories";

export const carParkRouter = createTRPCRouter({
    // Make sure the procedure name matches what we call in the frontend
    getCarparks: publicProcedure
        .query(async () => {
            // Get carparks from repository
            const carparks = await carParkRepository.findAll();
            return carparks.map(carpark => carpark.getValue());
        }),
        
    // Make sure the procedure name matches what we call in the frontend
    refreshAvailability: protectedProcedure
        .mutation(async ({ctx}) => {
            const hdbDataService = new HDBDataService();
            await hdbDataService.processData();
            return { success: true };
        })
});