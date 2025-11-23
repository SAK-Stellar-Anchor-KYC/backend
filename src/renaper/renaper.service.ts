import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KycPayload,
  RenaperValidationResponse,
  RenaperAdapter,
} from './interfaces/renaper.interface';

/**
 * Mock RENAPER Adapter
 *
 * This is a simulated implementation of the RENAPER integration.
 * Replace this with actual RENAPER API calls when integrating with the real service.
 *
 * Real integration steps:
 * 1. Use the RENAPER_API_URL and RENAPER_API_KEY from config
 * 2. Make HTTP requests to RENAPER endpoints
 * 3. Handle RENAPER response format
 * 4. Map RENAPER status to our KycStatus enum
 * 5. Handle errors and retries appropriately
 */
@Injectable()
export class RenaperService implements RenaperAdapter {
  private renaperApiUrl: string;
  private renaperApiKey: string;

  constructor(private configService: ConfigService) {
    this.renaperApiUrl = this.configService.get<string>('app.renaper.apiUrl');
    this.renaperApiKey = this.configService.get<string>('app.renaper.apiKey');
  }

  /**
   * Validates BASE KYC data against RENAPER (Mock Implementation)
   *
   * @param data - KYC payload with user information
   * @returns Validation response with status
   */
  async validateBaseKyc(data: KycPayload): Promise<RenaperValidationResponse> {
    console.log('[RENAPER] Processing KYC validation for DNI:', data.dni);
    console.log('[RENAPER] API URL:', this.renaperApiUrl);

    // Simulate network latency (200-500ms)
    await this.simulateNetworkDelay();

    // Mock validation logic - Replace with actual RENAPER API call
    const status = this.mockValidationLogic(data);

    const response: RenaperValidationResponse = {
      status,
      providerResponse: {
        dni: data.dni,
        name: data.name,
        lastname: data.lastname,
        validated: status === 'KYC_VALID',
        timestamp: new Date().toISOString(),
        // Mock RENAPER-specific fields
        renaperReference: `RENAPER-${Date.now()}`,
        matchScore: status === 'KYC_VALID' ? 0.98 : 0.45,
      },
    };

    console.log(`[RENAPER] Validation result: ${status}`);

    return response;
  }

  /**
   * Simulates network delay for realistic testing
   */
  private async simulateNetworkDelay(): Promise<void> {
    const delay = Math.floor(Math.random() * 300) + 200;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Mock validation logic
   *
   * Replace this with actual RENAPER API integration:
   *
   * Example real implementation:
   * ```typescript
   * const response = await axios.post(
   *   `${this.renaperApiUrl}/validate`,
   *   {
   *     dni: data.dni,
   *     name: data.name,
   *     lastname: data.lastname,
   *     dob: data.dob,
   *   },
   *   {
   *     headers: {
   *       'Authorization': `Bearer ${this.renaperApiKey}`,
   *       'Content-Type': 'application/json',
   *     },
   *   }
   * );
   *
   * return this.mapRenaperResponse(response.data);
   * ```
   */
  private mockValidationLogic(data: KycPayload): 'KYC_VALID' | 'KYC_REJECTED' | 'KYC_PENDING' {
    const dniNumber = parseInt(data.dni, 10);

    // Mock rules for demonstration
    // Even DNI -> Valid
    // DNI ending in 5 -> Pending
    // Others -> Rejected
    if (dniNumber % 2 === 0) {
      return 'KYC_VALID';
    } else if (data.dni.endsWith('5')) {
      return 'KYC_PENDING';
    } else {
      return 'KYC_REJECTED';
    }
  }

  /**
   * Maps RENAPER response to our standardized format
   * Use this method when integrating with real RENAPER API
   */
  private mapRenaperResponse(renaperResponse: any): RenaperValidationResponse {
    // TODO: Map actual RENAPER response fields to our interface
    return {
      status: 'KYC_VALID', // Map from RENAPER status
      providerResponse: renaperResponse,
    };
  }
}
