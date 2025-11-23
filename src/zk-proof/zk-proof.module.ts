import { Module } from '@nestjs/common';
import { ZkProofService } from './zk-proof.service';

@Module({
  providers: [ZkProofService],
  exports: [ZkProofService],
})
export class ZkProofModule {}
