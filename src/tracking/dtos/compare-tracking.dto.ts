import { ApiProperty } from '@nestjs/swagger';
import { GetTrackingDto } from './get-tracking.dto';
import { ValidateNested, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// DTO untuk masing-masing item/grup yang dibandingkan
export class CompareItemDto {
  @ApiProperty({
    description: 'Label penamaan untuk grup ini (misal: Packing Semarang)',
  })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Filter parameter untuk grup ini' })
  @ValidateNested()
  @Type(() => GetTrackingDto)
  filter: GetTrackingDto;
}

// DTO utama yang menerima array (bisa 2, 3, 4 grup, dst)
export class CompareTrackingDto {
  @ApiProperty({
    type: [CompareItemDto],
    description:
      'Daftar grup data yang ingin dibandingkan jumlahnya. Mendukung komparasi 2 grup atau lebih.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompareItemDto)
  comparisons: CompareItemDto[];
}
