import { Module } from '@nestjs/common';
import { UOMsService } from './uoms.service';
import { UOMsController } from './uoms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UOMsController],
  providers: [UOMsService],
  exports: [UOMsService],
})
export class UOMsModule {}
