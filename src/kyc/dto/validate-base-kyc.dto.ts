import { IsString, IsNotEmpty, IsDateString, IsEmail, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateBaseKycDto {
  @ApiProperty({
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    description: 'Wallet address',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid wallet address format',
  })
  walletAddress: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: '12345678', description: 'DNI number (7-10 digits)' })
  @IsString()
  @IsNotEmpty()
  @Length(7, 10)
  dni: string;

  @ApiProperty({ example: '1990-01-15', description: 'Date of birth (YYYY-MM-DD)' })
  @IsDateString()
  dob: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'AR', description: 'Country of residence (ISO code)' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 3)
  country: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Selfie photo for face verification',
    required: true,
  })
  selfie: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Document photo (DNI/passport)',
    required: true,
  })
  docPhoto: any;
}
