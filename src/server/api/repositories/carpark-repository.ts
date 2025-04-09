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

            return results.map((result) =>  new CarPark({...result}))
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

            const queries = entities.map((entity) => 
                this.db
                    .update(carParkSchema)
                    .set({
                        ...entity.getValue(),
                        updatedAt: new Date()
                    })
                    .where(eq(carParkSchema.id, entity.getValue().id))
            )
            
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