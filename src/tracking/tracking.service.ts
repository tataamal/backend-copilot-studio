import { Injectable } from '@nestjs/common';
import { TrackingDto } from './tracking.dto';
import { FabricService } from '../database/fabric/fabric.service';

@Injectable()
export class TrackingService {
  constructor(private readonly fabricService: FabricService) {}

  // PASTIKAN NAMA FUNGSI INI ADALAH getSerialNumber
  async getSerialNumber(dto: TrackingDto) {
    const query = `
      SELECT serialno, process, process_status, posting_date, person, inspect
      FROM z_rfc_trck_sernum_long
      WHERE tipe = '${dto.tipe}' 
        AND process = '${dto.process}'
        AND posting_date = '${dto.posting_date}'
    `;

    const data = await this.fabricService.executeQuery(query);

    return {
      status: 'success',
      data: data,
    };
  }
}
