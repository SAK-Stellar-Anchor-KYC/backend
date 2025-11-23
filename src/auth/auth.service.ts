import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { JwtPayload } from './strategies/jwt.strategy';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generates a JWT token for a given API key
   * @param apiKey - The validated API key
   * @returns Token response with access token and metadata
   */
  async generateToken(apiKey: string): Promise<TokenResponseDto> {
    // Generate subject identifier from API key (deterministic hash)
    const sub = this.generateSubject(apiKey);

    const payload: JwtPayload = {
      sub,
      scopes: [],
    };

    const expiresIn = this.configService.get<number>('app.jwt.ttl', 1800);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  /**
   * Generates a deterministic subject identifier from an API key
   * @param apiKey - The API key
   * @returns A hashed identifier
   */
  private generateSubject(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex').substring(0, 16);
  }
}
