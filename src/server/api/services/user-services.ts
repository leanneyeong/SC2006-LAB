import { TRPCError } from "@trpc/server";
import { User } from "../models/user";
import { UserRepository } from "../repositories/user-repository";
import { clerkClient } from "@clerk/nextjs/server";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async register(
    id: string,
    firstName: string,
    lastName: string,
    email: string
  ): Promise<void> {
    const user = new User({
      id,
      firstName,
      lastName,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.save(user);
  }

  public async updateNameDetails(
    userId: string,
    firstName: string,
    lastName: string
  ){
    const user = await this.userRepository.findOneByUserId(userId);

    const updatedUser = user.setNames(firstName, lastName)

    await Promise.all([
      this.userRepository.update(updatedUser),
      clerkClient.users.updateUser(userId,{
        firstName,
        lastName
      })
    ])
    return
  }

  public async getUserDetails(userId: string) {
    const user = await this.userRepository.findOneByUserId(userId);
    return {
      firstName: user.getValue().firstName,
      lastName: user.getValue().lastName,
      email: user.getValue().email,
    }
  }

  public async updatePassword(
    userId: string,
    password: string
) {
    try{
        await clerkClient.users.updateUser(userId,{
            password: password
        })
        return;
    } catch(err){
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