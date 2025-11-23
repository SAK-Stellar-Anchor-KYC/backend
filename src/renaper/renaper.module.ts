import { Module } from '@nestjs/common';
import { RenaperService } from './renaper.service';

@Module({
  providers: [RenaperService],
  exports: [RenaperService],
})
export class RenaperModule {}
