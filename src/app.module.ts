import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KycModule } from './kyc/kyc.module';
import { RenaperModule } from './renaper/renaper.module';
import { ZkProofModule } from './zk-proof/zk-proof.module';

@Module({
  imports: [
    // Load configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
            limit: parseInt(process.env.RATE_LIMIT_REQUESTS, 10) || 100,
          },
        ],
      }),
    }),
    // Feature modules
    AuthModule,
    UsersModule,
    KycModule,
    RenaperModule,
    ZkProofModule,
  ],
})
export class AppModule {}
