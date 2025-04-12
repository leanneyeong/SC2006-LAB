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
            console.log(`Updating ${entities.length} carparks individually`);
            
            // Process each entity individually instead of using batch
            for (const entity of entities) {
                const entityValue = entity.getValue();
                
                await this.db
                    .update(carParkSchema)
                    .set({
                        ...entityValue as any, // Type assertion for compatibility
                        availableLots: entityValue.availableLots, // Explicitly set this field
                        updatedAt: new Date()
                    })
                    .where(eq(carParkSchema.id, entityValue.id));
            }
            
            console.log('All updates completed successfully');
        } catch(err){
            console.error('Error updating carparks:', err);
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: e.message
            })
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
            const userData = await this.db
                .select()
                .from(carParkSchema)
                .where(eq(carParkSchema.id, id))
                .limit(1)
            
            if (!userData[0]) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Unable to find CarPark"
            })
            
            // Type assertion to match the structure expected by CarPark constructor
            const carParkData = {
                id: userData[0].id,
                carParkNo: userData[0].carParkNo,
                address: userData[0].address,
                location: userData[0].location,
                carParkType: userData[0].carParkType,
                typeOfParkingSystem: userData[0].typeOfParkingSystem,
                shortTermParking: userData[0].shortTermParking,
                freeParking: userData[0].freeParking,
                nightParking: userData[0].nightParking,
                carParkDecks: userData[0].carParkDecks,
                gantryHeight: userData[0].gantryHeight,
                carParkBasement: userData[0].carParkBasement,
                availableLots: userData[0].availableLots,
                createdAt: userData[0].createdAt,
                updatedAt: userData[0].updatedAt
            };
            
            // Use type assertion since we can't import the interface
            return new CarPark(carParkData as any);
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