import { userRepository } from "../repositories";
import { UserService } from "./user-services";

export const userService = new UserService(userRepository)