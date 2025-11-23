import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { RenaperModule } from '../renaper/renaper.module';
import { ZkProofModule } from '../zk-proof/zk-proof.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [RenaperModule, ZkProofModule, UsersModule],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
