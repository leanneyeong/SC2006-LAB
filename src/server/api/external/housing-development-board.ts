import { TRPCError } from "@trpc/server";
import axios from "axios";
import { z } from "zod";

// Checks that the data pulled from api matches this structure (validator)
const hdbCarParkResponseValidator = z.object({
    items: z.array(z.object({
        timestamp: z.string().transform(val => new Date(val)), // Changed to string first
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
            console.log('Fetching data from HDB API...');
            const rawResponse = await axios.get(
                HousingDevelopmentBoard.BASE_URL
            );
            
            console.log('API response received. Sample:', 
                JSON.stringify(rawResponse.data.items?.[0]?.carpark_data?.slice(0, 2) || 'No data', null, 2)
            );
            
            // Try parsing without immediately throwing
            const parseResult = hdbCarParkResponseValidator.safeParse(rawResponse.data);
            
            if(!parseResult.success) {
                console.error('Validation errors:', parseResult.error.errors);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Invalid Data from HDB"
                });
            }
            
            if(!parseResult.data.items[0]) {
                console.error('No items found in the response');
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "No data available from HDB"
                });
            }
            
            console.log(`Successfully parsed ${parseResult.data.items[0].carpark_data.length} carpark entries`);
            
            return parseResult.data.items[0].carpark_data;
        } catch(err){
            console.error('Error in getAvailability:', err);
            
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: e.message
            });
        }
    }
}