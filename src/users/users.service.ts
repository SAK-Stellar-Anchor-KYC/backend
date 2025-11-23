import { Injectable, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from './interfaces/user.interface';

/**
 * UsersService manages wallet-based user registration
 * Data is stored in-memory using Maps for easy replacement with a real database
 */
@Injectable()
export class UsersService {
  // In-memory storage: Map<walletAddress, User>
  private users: Map<string, User> = new Map();

  /**
   * Registers a new user with their wallet address and KYC data
   * @param userData - User registration data including wallet and KYC info
   * @returns The created user record
   */
  registerUser(userData: {
    walletAddress: string;
    name: string;
    lastname: string;
    dni: string;
    dob: string;
    email: string;
    country: string;
    docPhotoPath?: string;
  }): User {
    const normalizedWallet = userData.walletAddress.toLowerCase();

    // Check if user already exists
    if (this.users.has(normalizedWallet)) {
      throw new ConflictException('Wallet address already registered');
    }

    const user: User = {
      userId: this.generateUserId(),
      walletAddress: normalizedWallet,
      name: userData.name,
      lastname: userData.lastname,
      dni: userData.dni,
      dob: userData.dob,
      email: userData.email,
      country: userData.country,
      docPhotoPath: userData.docPhotoPath,
      registeredAt: new Date(),
    };

    this.users.set(normalizedWallet, user);

    console.log(
      `[Users] Registered new user: ${user.userId} (${userData.name} ${userData.lastname})`,
    );

    return user;
  }

  /**
   * Gets a user by wallet address
   * @param walletAddress - The wallet address
   * @returns The user or undefined
   */
  getUserByWallet(walletAddress: string): User | undefined {
    return this.users.get(walletAddress.toLowerCase());
  }

  /**
   * Generates a unique user ID
   */
  private generateUserId(): string {
    return `usr_${uuidv4().substring(0, 8)}`;
  }

  /**
   * Gets all users (for debugging/admin purposes)
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
}
