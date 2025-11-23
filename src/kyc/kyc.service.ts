import { Injectable } from '@nestjs/common';
import { KycRecord, KycStatus } from './interfaces/kyc-record.interface';
import { RenaperService } from '../renaper/renaper.service';
import { ZkProofService } from '../zk-proof/zk-proof.service';
import { UsersService } from '../users/users.service';
import { KycPayload } from '../renaper/interfaces/renaper.interface';

/**
 * KycService manages KYC validation and status
 * Data is stored in-memory using Maps for easy replacement with a real database
 */
@Injectable()
export class KycService {
  // In-memory storage: Map<walletAddress, KycRecord>
  private kycRecords: Map<string, KycRecord> = new Map();

  constructor(
    private renaperService: RenaperService,
    private zkProofService: ZkProofService,
    private usersService: UsersService,
  ) {}

  /**
   * Validates BASE KYC data and registers user if not exists
   * @param kycData - KYC payload with user information and files
   * @returns Validation response with status and proof
   */
  async validateBaseKyc(kycData: KycPayload): Promise<{
    status: KycStatus;
    proof?: string;
  }> {
    const normalizedWallet = kycData.walletAddress.toLowerCase();

    console.log(`[KYC] Starting BASE validation for wallet: ${normalizedWallet}`);

    // Register user if not already registered
    const existingUser = this.usersService.getUserByWallet(normalizedWallet);
    if (!existingUser) {
      console.log(`[KYC] Registering new user: ${normalizedWallet}`);

      // Store document photo path (in production, save to cloud storage)
      const docPhotoPath = `uploads/docs/${Date.now()}_${kycData.docPhoto.originalname}`;

      this.usersService.registerUser({
        walletAddress: normalizedWallet,
        name: kycData.name,
        lastname: kycData.lastname,
        dni: kycData.dni,
        dob: kycData.dob,
        email: kycData.email,
        country: kycData.country,
        docPhotoPath,
      });
    }

    // Validate with RENAPER
    const renaperResponse = await this.renaperService.validateBaseKyc(kycData);

    let proof: string | undefined;

    // Generate ZK proof if validation succeeded
    if (renaperResponse.status === 'KYC_VALID') {
      proof = this.zkProofService.generateProof(normalizedWallet, kycData.dni, Date.now());
      console.log(`[KYC] Generated ZK proof for wallet: ${normalizedWallet}`);
    }

    // Store KYC record
    const kycRecord: KycRecord = {
      walletAddress: normalizedWallet,
      status: renaperResponse.status,
      proof,
      lastUpdated: new Date(),
      metadata: {
        name: kycData.name,
        lastname: kycData.lastname,
        dni: kycData.dni,
        dob: kycData.dob,
        country: kycData.country,
      },
    };

    this.kycRecords.set(normalizedWallet, kycRecord);

    console.log(`[KYC] Validation complete. Status: ${renaperResponse.status}`);

    return {
      status: renaperResponse.status,
      proof,
    };
  }

  /**
   * Gets KYC status for a wallet address
   * @param walletAddress - The wallet address
   * @returns KYC record or undefined
   */
  getKycStatus(walletAddress: string): KycRecord | undefined {
    return this.kycRecords.get(walletAddress.toLowerCase());
  }

  /**
   * Checks if a wallet has valid KYC
   * @param walletAddress - The wallet address
   * @returns true if KYC is valid
   */
  isWalletVerified(walletAddress: string): boolean {
    const record = this.getKycStatus(walletAddress);
    return record?.status === 'KYC_VALID';
  }

  /**
   * Gets all KYC records (for debugging/admin purposes)
   */
  getAllRecords(): KycRecord[] {
    return Array.from(this.kycRecords.values());
  }
}
