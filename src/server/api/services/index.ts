import { carParkRepository, userFavouriteRepository, userRepository, userReviewRepository } from "../repositories";
import { UserService } from "./user-services";

export const userService = new UserService(carParkRepository,userRepository,userReviewRepository,userFavouriteRepository)