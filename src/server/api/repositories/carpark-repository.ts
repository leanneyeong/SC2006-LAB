import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, and, isNull } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import carParkSchema from "~/server/db/schema/carparks-schema";
import userFavouriteSchema from "~/server/db/schema/user-favourite-schema";
import { CarPark } from "../models/carpark";

export class CarParkRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async findAll(){
        try{
            const results = await this.db
            .select(getTableColumns(carParkSchema))
            .from(carParkSchema)

            return results.map((result) => new CarPark(result))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: e.message
            })
        }
    }

    public async updateMany(entities: CarPark[]) {
        try {
            // Create all update queries
            const queries = entities.map((entity) => 
                this.db
                    .update(carParkSchema)
                    .set({
                        ...entity.getValue(),
                        updatedAt: new Date()
                    })
                    .where(eq(carParkSchema.id, entity.getValue().id))
            );
            
            // Process in batches of 20
            const batchSize = 20;
            
            // Process queries in batches
            for (let i = 0; i < queries.length; i += batchSize) {
                const batch = queries.slice(i, i + batchSize);
                if (batch.length > 0) {
                    await Promise.all(
                        batch.map(query => query.execute())
                    );
                }
            }
        } catch(err) {
            const e = err as Error;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: e.message
            });
        }
    }


    public async findUserFavourites(
        userId: string
    ) {
        try{
            const results = await this.db.select({
                id: carParkSchema.id,
                address: carParkSchema.address
            })
                .from(userFavouriteSchema)
                .innerJoin(carParkSchema,eq(carParkSchema.id,userFavouriteSchema.carParkId))
                .where(and(
                    eq(userFavouriteSchema.userId,userId),
                    isNull(userFavouriteSchema.deletedAt)
                ))

                return results
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findOneById(id: string): Promise<CarPark> {
        try {
            const result = await this.db
                .select()
                .from(carParkSchema)
                .where(eq(carParkSchema.id, id))
                .limit(1)
            
            if (!result[0]) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Unable to find CarPark"
            })
            
            
            // Use type assertion since we can't import the interface
            return new CarPark(result[0]);
        } catch (err) {
            if (err instanceof TRPCError) throw err;
            const e = err as Error;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: e.message
            })
        }
    }
}