import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  controllers: [TrackingController],
  providers: [TrackingService],
  imports: [DatabaseModule],
})
export class TrackingModule {}
