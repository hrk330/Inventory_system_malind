import { Module } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PosModule } from '../pos/pos.module';

@Module({
  imports: [PrismaModule, PosModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
