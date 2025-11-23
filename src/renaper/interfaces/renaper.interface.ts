export interface KycPayload {
  name: string;
  lastname: string;
  dni: string;
  dob: string;
  email: string;
  country: string;
  walletAddress: string;
  selfie?: Express.Multer.File;
  docPhoto?: Express.Multer.File;
}

export type KycStatus = 'KYC_VALID' | 'KYC_REJECTED' | 'KYC_PENDING';

export interface RenaperValidationResponse {
  status: KycStatus;
  providerResponse: any;
  proofCandidate?: string;
}

export interface RenaperAdapter {
  validateBaseKyc(data: KycPayload): Promise<RenaperValidationResponse>;
}
