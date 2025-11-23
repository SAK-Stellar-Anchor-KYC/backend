export type KycStatus = 'KYC_VALID' | 'KYC_REJECTED' | 'KYC_PENDING';

export interface KycRecord {
  walletAddress: string;
  status: KycStatus;
  proof?: string;
  lastUpdated: Date;
  metadata?: {
    name: string;
    lastname: string;
    dni: string;
    dob: string;
    country: string;
  };
}
