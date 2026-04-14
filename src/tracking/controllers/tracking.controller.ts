import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { GetTrackingDto } from '../dtos/get-tracking.dto'; // Update path import
import { TrackingService } from '../services/tracking.service'; // Update path import
import { CountTrackingDto } from '../dtos/count-tracking.dto'; // Update path import
import { CompareTrackingDto } from '../dtos/compare-tracking.dto';
import { LastUpdateDto } from '../dtos/last-update.dto'; // Update path import
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('api')
@Controller('api')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('get-data-serial-number')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mendapatkan data lengkap Serial Number' })
  async getSerialNumber(@Body() dto: GetTrackingDto) {
    return this.trackingService.getSerialNumber(dto);
  }

  @Post('count-data-serial-number')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Menghitung total unik Serial Number berdasarkan filter',
  })
  async countSerialNumber(@Body() dto: CountTrackingDto) {
    return this.trackingService.countSerialNumber(dto);
  }

  @Post('last-update-serial-number')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Mendapatkan waktu pembaruan data terakhir (global atau per filter)',
  })
  async getLastUpdate(@Body() dto: LastUpdateDto) {
    return this.trackingService.getLastUpdate(dto);
  }

  @Post('compare-data-serial-number')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Membandingkan dua kelompok data (misal: Packing Semarang vs Surabaya)',
  })
  async compareData(@Body() dto: CompareTrackingDto) {
    return this.trackingService.compareData(dto);
  }
}
