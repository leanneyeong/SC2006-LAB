import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, isNull } from "drizzle-orm";
import userFavouriteSchema from "../../db/schema/user-favourite-schema";
import { UserFavourite } from "../models/user-favourite";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { db } from "~/server/db";

export class UserFavouriteRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async save(entity: UserFavourite){
        try{
            await this.db
            .insert(userFavouriteSchema)
            .values(entity.getValue())

            return;
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async deleteByUserId(
        userId: string
    ) {
        try{
            await this.db.update(userFavouriteSchema)
            .set({
                deletedAt: new Date()
            })
            .where(eq(
                userFavouriteSchema.userId, userId
            ))
        } catch(err) {
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findOneByCarParkAndUserIdOrNull(
        carParkId: string,
        userId: string
    ): Promise<UserFavourite | null> {
        try{
            const results = await this.db.select({
                ...getTableColumns(userFavouriteSchema)
            })
            .from(userFavouriteSchema)
            .where(and(
                eq(userFavouriteSchema.carParkId,carParkId),
                eq(userFavouriteSchema.userId, userId),
                isNull(userFavouriteSchema.deletedAt)
            ))
            .limit(1)

            if(!results[0]) return null;
            return new UserFavourite({...results[0]})

        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findManyByUserId(
        userId:string
    ): Promise<UserFavourite[]> {
        try{
            const results = await this.db.select()
                .from(userFavouriteSchema)
                .where(eq(userFavouriteSchema.userId,userId))

            return results.map((result) => {
                return new UserFavourite({
                    ...result
                })
            })
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async update(entity: UserFavourite){
        try{
            await this.db.update(userFavouriteSchema)
            .set({
                ...entity.getValue()
            })
            .where(eq(userFavouriteSchema.id,entity.getValue().id))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

}

// Create and export an instance of UserFavouriteRepository
export const userFavouriteRepository = new UserFavouriteRepository(db);