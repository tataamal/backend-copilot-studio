import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class LastUpdateDto {
  @ApiPropertyOptional({
    description:
      'Filter berdasarkan lokasi/plant untuk melihat update terakhir spesifik area',
    example: 'Semarang',
    enum: ['Semarang', 'Surabaya', 'Semarang & Surabaya'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Semarang', 'Surabaya', 'Semarang & Surabaya'])
  tipe?: string;

  @ApiPropertyOptional({
    description:
      'Filter berdasarkan proses untuk melihat update terakhir spesifik tahapan',
    example: 'PACKING',
    enum: ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING', 'ALL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASSY', 'PAINTING', 'PACKING', 'BLEACHING', 'ALL'])
  process?: string;
}
