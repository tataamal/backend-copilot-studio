import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { TrackingDto } from './tracking.dto';
import { TrackingService } from './tracking.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Tracking')
@Controller('tracking')
// PERHATIKAN BARIS INI: Pastikan namanya persis "TrackingController" dengan awalan export
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('serial-number')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mencari data tracking serial number' })
  async getSerialNumber(@Body() dto: TrackingDto) {
    return this.trackingService.getSerialNumber(dto);
  }
}
