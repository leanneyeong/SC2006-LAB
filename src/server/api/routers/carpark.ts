import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { HDBDataService } from "../services/hdb-data-service";

export const carParkRouter = createTRPCRouter({
    refreshAvailability: protectedProcedure
    .query(async ({ctx}) => {
        const hdbDataService = new HDBDataService()
        await hdbDataService.processData()
        return;
    })
})
