import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { TokenResponseDto } from './dto/token-response.dto';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('token')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ summary: 'Generate JWT token using API Key' })
  @ApiSecurity('x-api-key')
  @ApiResponse({
    status: 201,
    description: 'JWT token generated successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid API Key' })
  async generateToken(@Req() req: Request): Promise<TokenResponseDto> {
    const apiKey = req.headers['x-api-key'] as string;
    return this.authService.generateToken(apiKey);
  }
}
