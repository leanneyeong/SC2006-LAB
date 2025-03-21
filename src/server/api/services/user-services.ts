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

  public async getUserDetails(userId: string) {
    const user = await this.userRepository.findOneByUserId(userId);
    return {
      firstName: user.getValue().firstName,
      lastName: user.getValue().lastName,
      email: user.getValue().email,
    }
  }

}