import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsDateString } from 'class-validator';

export class TrackingDto {
  @ApiProperty({ description: 'Plant produksi', example: 'Semarang' })
  @IsString()
  @IsIn(['Semarang', 'Surabaya'])
  tipe!: string;

  @ApiProperty({ description: 'Tahapan proses', example: 'PACKING' })
  @IsString()
  @IsIn(['ASSY', 'PAINTING', 'PACKING', 'BLEACHING'])
  process!: string;

  @ApiProperty({
    description: 'Tanggal transaksi (YYYY-MM-DD)',
    example: '2026-04-11',
  })
  @IsDateString()
  posting_date!: string;
}
