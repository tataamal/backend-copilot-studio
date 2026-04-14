import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetTrackingDto {
  @ApiPropertyOptional({
    description: 'Bagian/plant',
    example: 'Semarang',
    enum: ['Semarang', 'Surabaya', 'Semarang & Surabaya'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['Semarang', 'Surabaya', 'Semarang & Surabaya'])
  tipe?: string;

  @ApiPropertyOptional({
    description: 'Tahapan proses',
    example: 'PACKING',
    enum: ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING', 'ALL'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASSY', 'PAINTING', 'PACKING', 'BLEACHING', 'ALL'])
  process?: string;

  // --- NORMALISASI TANGGAL TRANSAKSI ---
  @ApiPropertyOptional({
    description: 'Tanggal transaksi (DD-MM-YYYY)',
    example: '10-04-2026',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ubah DD-MM-YYYY menjadi YYYY-MM-DD agar validasi IsDateString dan Postgres tidak error
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return value;
  })
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

  // --- NORMALISASI TANGGAL RELEASE ---
  @ApiPropertyOptional({
    description: 'Tanggal rilis (DD-MM-YYYY)',
    example: '10-04-2026',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return value;
  })
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
}
