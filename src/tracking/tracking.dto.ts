import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrackingDto {
  @ApiProperty({
    description: 'Bagian/plant',
    example: 'Semarang',
    enum: ['Semarang', 'Surabaya', 'Semarang & Surabaya'],
  })
  @IsString()
  @IsIn(['Semarang', 'Surabaya', 'Semarang & Surabaya'])
  tipe!: string;

  @ApiProperty({
    description: 'Tahapan proses',
    example: 'PACKING',
    enum: ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING', 'ALL'],
  })
  @IsString()
  @IsIn(['ASSY', 'PAINTING', 'PACKING', 'BLEACHING', 'ALL'])
  process!: string;

  @ApiPropertyOptional({
    description: 'Tanggal transaksi (YYYY-MM-DD)',
    example: '2026-04-10',
  })
  @IsOptional()
  @IsDateString()
  posting_date?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  serialno?: string;

  @ApiPropertyOptional({ example: '5000123456 - 10' })
  @IsOptional()
  @IsString()
  so_item?: string;

  @ApiPropertyOptional({ example: 'PACKING' })
  @IsOptional()
  @IsString()
  process_status?: string;

  @ApiPropertyOptional({ example: 15000.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  net_price?: number;

  @ApiPropertyOptional({ example: 14000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  standard_price?: number;

  @ApiPropertyOptional({ example: 'IDR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'MAT-001' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 'BATCH-001' })
  @IsOptional()
  @IsString()
  batch?: string;

  @ApiPropertyOptional({ example: 'SL01' })
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiPropertyOptional({ example: 'PRD0001' })
  @IsOptional()
  @IsString()
  pro?: string;

  @ApiPropertyOptional({ example: 'MRP01' })
  @IsOptional()
  @IsString()
  mrp?: string;

  @ApiPropertyOptional({ example: '5000001234' })
  @IsOptional()
  @IsString()
  material_doc?: string;

  @ApiPropertyOptional({ example: '2026-04-10' })
  @IsOptional()
  @IsDateString()
  release_date?: string;

  @ApiPropertyOptional({ example: '10012345' })
  @IsOptional()
  @IsString()
  person?: string;

  @ApiPropertyOptional({ example: 'MAT-INS-001' })
  @IsOptional()
  @IsString()
  material_inspection?: string;

  @ApiPropertyOptional({ example: 'BATCH-INS-001' })
  @IsOptional()
  @IsString()
  batch_inspection?: string;

  @ApiPropertyOptional({ example: 'SL02' })
  @IsOptional()
  @IsString()
  storage_inspection?: string;

  @ApiPropertyOptional({ example: 'PRD-INS-001' })
  @IsOptional()
  @IsString()
  pro_inspection?: string;

  @ApiPropertyOptional({ example: 'MRP02' })
  @IsOptional()
  @IsString()
  mrp_inspection?: string;

  @ApiPropertyOptional({ example: '5000005678' })
  @IsOptional()
  @IsString()
  material_doc_inspection?: string;

  @ApiPropertyOptional({ example: '10054321' })
  @IsOptional()
  @IsString()
  inspect?: string;

  @ApiPropertyOptional({ example: 'SMG' })
  @IsOptional()
  @IsIn(['SMG', 'SBY'])
  bagian_file?: 'SMG' | 'SBY';
}
