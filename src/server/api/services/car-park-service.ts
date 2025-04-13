
import { TRPCError } from "@trpc/server";
import { CarPark } from "../models/carpark";
import { CarParkRepository } from "../repositories/carpark-repository";
import Location from "../types/location";
import { v4 as uuidv4 } from 'uuid';
import { UserFavourite } from "../models/user-favourite";
import { UserFavouriteRepository } from "../repositories/user-favourite-repository";
import { UserReview } from "../models/user-review";
import { UserReviewRepository } from "../repositories/user-review-repository";
import CarParkReviewItems from "../types/carpark-review";
interface CarParkDetails {
    id: string
    name: string
    address: string | null
    capacity: number
    location: Location
    availableLots: number
}

interface FullCarParkDetails extends CarParkDetails{
    isFavourited: boolean
    location: Location
    nearByCarParks: CarParkDetails[]
    reviews: CarParkReviewItems[]
}

export class CarParkService{
    private carParkRepository: CarParkRepository
    private userFavouriteRepository: UserFavouriteRepository
    private userReviewRepository: UserReviewRepository

    constructor(
        carParkRepository: CarParkRepository,
        userFavouriteRepository: UserFavouriteRepository,
        userReviewRepository: UserReviewRepository
    ){
        this.carParkRepository = carParkRepository
        this.userFavouriteRepository = userFavouriteRepository
        this.userReviewRepository = userReviewRepository
    }

    public async setFavourite(
        userId:string,
        carParkId: string,
        isFavourited: boolean
    ){
        try{
            const existingFavourite = await this.userFavouriteRepository.findOneByCarParkAndUserIdOrNull(
                carParkId,
                userId
            )
    
            //User wants to set to favourite but it already favourited
            if(isFavourited && existingFavourite){
                throw new TRPCError({
                    code:"BAD_REQUEST",
                    message:"Car park already favourited by user"
                })
            }
            //User wants to set to not favourited but already favourited
            else if(!isFavourited && existingFavourite){
                await this.userFavouriteRepository.hardDelete(existingFavourite.getValue().id)
            }
            // User wants to set to favourite but is not favourited
            else if(isFavourited && !existingFavourite){
                await this.userFavouriteRepository.save(new UserFavourite({
                    id: uuidv4(),
                    carParkId,
                    userId,
                    createdAt: new Date(),
                    deletedAt: null
                }))
            }
            // User wants to set to not favourite but not favourited
            else {
                throw new TRPCError({
                    code:"BAD_REQUEST",
                    message:"Car park not favourited by user"
                })
            }
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async createReview(
        userId:string,
        carParkId: string,
        rating: number,
        description: string
    ){
        try{
    
            const [carPark, existingReview] = await Promise.all([
                await this.carParkRepository.findOneById(carParkId),
                await this.userReviewRepository.findOneByUserIdAndCarParkIdOrNull(
                    userId,
                    carParkId
                )
            ]);
    
            if(existingReview) throw new TRPCError({
                code:"BAD_REQUEST",
                message:"You have already written a review for this car park"
            })
    
            const currentDate = new Date();
            const userReview = new UserReview({
                carParkId,
                userId,
                rating,
                description,
                createdAt: currentDate,
                updatedAt: currentDate,
                deletedAt: null
            })
            await this.userReviewRepository.save(userReview)
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

}
