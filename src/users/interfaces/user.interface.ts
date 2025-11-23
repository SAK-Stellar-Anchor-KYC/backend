export interface User {
  userId: string;
  walletAddress: string;
  name: string;
  lastname: string;
  dni: string;
  dob: string;
  email: string;
  country: string;
  docPhotoPath?: string;
  registeredAt: Date;
}
