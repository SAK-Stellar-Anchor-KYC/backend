import { ApiProperty } from '@nestjs/swagger';

export class KycStatusResponseDto {
  @ApiProperty({ example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' })
  walletAddress: string;

  @ApiProperty({
    example: 'KYC_VALID',
    enum: ['KYC_VALID', 'KYC_REJECTED', 'KYC_PENDING', 'NOT_FOUND'],
  })
  status: string;

  @ApiProperty({
    example: 'zkp_1700000000_abc123...',
    required: false,
  })
  proof?: string;

  @ApiProperty({ example: '2023-11-22T10:30:00.000Z', required: false })
  lastUpdated?: string;
}
