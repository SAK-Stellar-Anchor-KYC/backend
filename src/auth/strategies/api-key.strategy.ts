import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  private apiKeys: string[];

  constructor(private configService: ConfigService) {
    super();
    this.apiKeys = this.configService.get<string[]>('app.apiKeys', []);
  }

  async validate(req: Request): Promise<any> {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API Key is required');
    }

    const isValid = this.apiKeys.includes(apiKey);

    if (!isValid) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Return the API key as identifier (used to generate anchorId)
    return { apiKey };
  }
}
