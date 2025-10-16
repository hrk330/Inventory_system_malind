import { Module } from '@nestjs/common';
import { ReorderService } from './reorder.service';
import { ReorderController } from './reorder.controller';

@Module({
  providers: [ReorderService],
  controllers: [ReorderController],
  exports: [ReorderService],
})
export class ReorderModule {}
