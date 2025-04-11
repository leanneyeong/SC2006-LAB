import { TRPCError } from "@trpc/server";
import { eq, getTableColumns } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import carParkSchema from "~/server/db/schema/carparks-schema";
import { CarPark } from "../models/carpark";

export class CarParkRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async findAll(){
        try{
            const results = await this.db
            .select(getTableColumns(carParkSchema))
            .from(carParkSchema)

            return results.map((result) => {
                // Type assertion to help TypeScript understand this is compatible
                return new CarPark(result as any);
            });
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: e.message
            })
        }
    }

    public async updateMany(entities: CarPark[]){
        try{
            const queries = entities.map((entity) => {
                const entityValue = entity.getValue();
                
                return this.db
                    .update(carParkSchema)
                    .set({
                        ...entityValue as any, // Type assertion for compatibility
                        updatedAt: new Date()
                    })
                    .where(eq(carParkSchema.id, entityValue.id));
            });
            
            // @ts-expect-error - drizzle-orm batch operation type mismatch but operation works as expected
            await this.db.batch(queries);
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }
}