import { TRPCError } from "@trpc/server";
import axios from "axios";
import { z } from "zod";

//checks that the data pulled from api matches this structure (validator)
const hdbCarParkResponseValidator = z.object({
    items: z.array(z.object({
        timestamp: z.date(),
        carpark_data: z.array(z.object({
            carpark_info: z.array(z.object({
                total_lots: z.string().transform((val) => parseInt(val, 10)),
                lot_type: z.string(),
                lots_available: z.string().transform((val) => parseInt(val, 10))
            })),
            carpark_number: z.string(),
            update_datetime: z.string()
        }))
    }))
})


export class HousingDevelopmentBoard {
    private static readonly BASE_URL = 'https://api.data.gov.sg/v1/transport/carpark-availability'

    constructor(){}

    public async getAvailability() {
        try{
            const rawResponse = await axios.get(
                HousingDevelopmentBoard.BASE_URL
            )

            const response = hdbCarParkResponseValidator.safeParse(rawResponse.data)
            if(!response.success || !response.data.items[0]) throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: "Invalid Data from HDB"
            })

            return response.data.items[0].carpark_data
        } catch(err){
            if(err instanceof TRPCError) throw err

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: e.message
            })
        }
    }
}