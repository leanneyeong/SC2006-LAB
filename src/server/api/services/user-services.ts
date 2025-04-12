import { TRPCError } from "@trpc/server";
import { User } from "../models/user";
import UserDetails from "../types/user-details";
import { UserRepository } from "../repositories/user-repository";
import { CarParkRepository } from "../repositories/carpark-repository";
import { clerkClient } from "@clerk/nextjs/server";
import FavouriteCarPark from "../types/favourite-carpark";
import { UserReviewRepository } from "../repositories/user-review-repository";
import { UserFavouriteRepository } from "../repositories/user-favourite-repository";

export class UserService {
  private carParkRepository: CarParkRepository;
  private userRepository: UserRepository;
  private userReviewRepository: UserReviewRepository;
  private userFavouriteRepository: UserFavouriteRepository;

  constructor(
      carParkRepository: CarParkRepository,
      userRepository: UserRepository,
      userReviewRepository: UserReviewRepository,
      userFavouriteRepository: UserFavouriteRepository,
  ){
      this.carParkRepository = carParkRepository;
      this.userRepository = userRepository;
      this.userReviewRepository = userReviewRepository;
      this.userFavouriteRepository = userFavouriteRepository;
  }

  public async getFavouriteCarParks(userId: string): Promise<FavouriteCarPark[]> {
    const userFavourites = await this.carParkRepository.findUserFavourites(userId);
    
    // Ensuring the return type matches FavouriteCarPark
    return userFavourites.map((carPark) => {
      return {
        ...carPark,
        isFavourited: true
      } as FavouriteCarPark;
    });
  }
  
  public async updateNames(
      userId: string,
      firstName: string,
      lastName: string
  ): Promise<void> {
      try {
          const user = await this.userRepository.findOneByUserId(userId);
          const updatedUser = user.setNames(firstName, lastName);

          await this.userRepository.update(updatedUser);
          return;
      } catch(err) {
          if(err instanceof TRPCError) throw err;

          const e = err as Error;
          throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: e.message
          });
      }
  }

  public async updateMainSettings(
      userId: string,
      isDarkMode: boolean
  ): Promise<void> {
      try {
          const user = await this.userRepository.findOneByUserId(userId);
          const updatedUser = user.setMainSettings(
             isDarkMode
          );

          await this.userRepository.update(updatedUser);
          return;
      } catch(err) {
          if(err instanceof TRPCError) throw err;

          const e = err as Error;
          throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: e.message
          });
      }
  }

  public async register(
      userId: string,
      firstName: string | null,
      lastName: string | null,
      email: string,
  ): Promise<{ status: number } | void> {
      try {
          const existingUser = await this.userRepository.findOneByUserIdOrNull(userId);

          if (existingUser) return { status: 200 };
      
          const currentDate = new Date();
          const newUser = new User({
            id: userId,
            email,
            firstName: firstName ?? "NOT SET",
            lastName: lastName ?? "NOT SET",
            isDarkMode: false,
            createdAt: currentDate,
            deletedAt: null, 
            updatedAt: currentDate
          });

          await this.userRepository.save(newUser);
          return;
      } catch(err) {
          if(err instanceof TRPCError) throw err;

          const e = err as Error;
          throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: e.message
          });
      }
  }

  public async deleteUser(userId: string): Promise<void> {
      try {
          const user = await this.userRepository.findOneByUserId(userId);
          const deletedUser = user.delete();

          await Promise.all([
              clerkClient.users.deleteUser(userId),
              this.userRepository.update(deletedUser),
              this.userReviewRepository.deleteByUserId(userId),
              this.userFavouriteRepository.deleteByUserId(userId)
          ]);

          return;
      } catch(err) {
          if(err instanceof TRPCError) throw err;

          const e = err as Error;
          throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: e.message
          });
      }
  }

  public async getUser(userId: string): Promise<UserDetails> {
      try {
          const user = await this.userRepository.findOneByUserId(userId);
  
          return {
              ...user.getValue(),
          };
      } catch(err) {
          if(err instanceof TRPCError) throw err;

          const e = err as Error;
          throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: e.message
          });
      }
  }

  public async updatePassword(
      userId: string,
      password: string
  ): Promise<void> {
      try {
          await clerkClient.users.updateUser(userId, {
              password: password
          });
          return;
      } catch(err) {
          if (typeof err === 'object' && err !== null && 'errors' in err) {
            // This is likely a Clerk API error
            const clerkError = err as { errors: { message: string }[] };
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: clerkError.errors[0]?.message
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred"
          });
      }
  }
}