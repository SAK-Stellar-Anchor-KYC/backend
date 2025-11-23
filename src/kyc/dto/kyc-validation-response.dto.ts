import { ApiProperty } from '@nestjs/swagger';

export class KycValidationResponseDto {
  @ApiProperty({
    example: 'KYC_VALID',
    enum: ['KYC_VALID', 'KYC_REJECTED', 'KYC_PENDING'],
  })
  status: 'KYC_VALID' | 'KYC_REJECTED' | 'KYC_PENDING';

  @ApiProperty({
    example: 'zkp_1700000000_abc123...',
    required: false,
    description: 'ZK proof (only present if status is KYC_VALID)',
  })
  proof?: string;
}
