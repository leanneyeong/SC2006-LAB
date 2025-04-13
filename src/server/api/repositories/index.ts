import { db } from "~/server/db";
import { UserRepository } from "./user-repository";
import { CarParkRepository } from "./carpark-repository";
import { UserFavouriteRepository } from "./user-favourite-repository";
import { UserReviewRepository } from "./user-review-repository";

export const userRepository = new UserRepository(db)
export const userFavouriteRepository = new UserFavouriteRepository(db)
export const userReviewRepository = new UserReviewRepository(db)
export const carParkRepository = new CarParkRepository(db)