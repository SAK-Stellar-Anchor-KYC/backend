import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KycService } from './kyc.service';
import { ValidateBaseKycDto } from './dto/validate-base-kyc.dto';
import { KycValidationResponseDto } from './dto/kyc-validation-response.dto';
import { KycStatusResponseDto } from './dto/kyc-status-response.dto';
import { KycPayload } from '../renaper/interfaces/renaper.interface';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private kycService: KycService) {}

  @Post('base/validate')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'selfie', maxCount: 1 },
      { name: 'docPhoto', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Validate BASE KYC with document upload',
    description:
      'Submit KYC information including personal data, selfie, and document photo for validation. This endpoint handles both user registration and KYC validation.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'KYC validation completed',
    type: KycValidationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or missing files' })
  async validateBaseKyc(
    @Body() validateKycDto: ValidateBaseKycDto,
    @UploadedFiles()
    files: {
      selfie?: Express.Multer.File[];
      docPhoto?: Express.Multer.File[];
    },
  ): Promise<KycValidationResponseDto> {
    // Validate that required files are present
    if (!files?.selfie?.[0] || !files?.docPhoto?.[0]) {
      throw new BadRequestException('Both selfie and docPhoto files are required');
    }

    const kycPayload: KycPayload = {
      name: validateKycDto.name,
      lastname: validateKycDto.lastname,
      dni: validateKycDto.dni,
      dob: validateKycDto.dob,
      email: validateKycDto.email,
      country: validateKycDto.country,
      walletAddress: validateKycDto.walletAddress,
      selfie: files.selfie[0],
      docPhoto: files.docPhoto[0],
    };

    console.log(
      `[KYC Controller] Received validation request for: ${validateKycDto.walletAddress}`,
    );
    console.log(`[KYC Controller] Selfie size: ${files.selfie[0].size} bytes`);
    console.log(`[KYC Controller] DocPhoto size: ${files.docPhoto[0].size} bytes`);

    const result = await this.kycService.validateBaseKyc(kycPayload);

    return {
      status: result.status,
      proof: result.proof,
    };
  }

  @Get('status/:walletAddress')
  @ApiOperation({ summary: 'Get KYC status for a wallet address' })
  @ApiParam({ name: 'walletAddress', description: 'The wallet address to check' })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved',
    type: KycStatusResponseDto,
  })
  async getKycStatus(@Param('walletAddress') walletAddress: string): Promise<KycStatusResponseDto> {
    const record = this.kycService.getKycStatus(walletAddress);

    if (!record) {
      return {
        walletAddress,
        status: 'NOT_FOUND',
      };
    }

    return {
      walletAddress: record.walletAddress,
      status: record.status,
      proof: record.proof,
      lastUpdated: record.lastUpdated.toISOString(),
    };
  }
}
