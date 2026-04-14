import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TrackingController } from './controllers/tracking.controller';
import { TrackingService } from './services/tracking.service';

@Module({
  controllers: [TrackingController],
  providers: [TrackingService],
  imports: [DatabaseModule],
})
export class TrackingModule {}
