import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GetTrackingDto } from '../dtos/get-tracking.dto';
import { CountTrackingDto } from '../dtos/count-tracking.dto';
import { CompareTrackingDto } from '../dtos/compare-tracking.dto';
import { LastUpdateDto } from '../dtos/last-update.dto';
import { PostgresService } from '../../database/postgres/postgres.service';

@Injectable()
export class TrackingService {
  constructor(private readonly postgresService: PostgresService) {}

  // 1. GET DATA SERIAL NUMBER
  async getSerialNumber(dto: GetTrackingDto) {
    try {
      // Gunakan fungsi helper agar tidak mengulang kode pembentukan filter
      const { whereSQL, values } = this.buildWhereClause(dto);

      const sql = `
        SELECT
          serialno, so_item, tipe, net_price, standard_price, currency, process_status,
          process_step, process, process_row_step, material, batch, storage, pro, mrp,
          material_doc, posting_date, release_date, person, material_inspection,
          batch_inspection, storage_inspection, pro_inspection, mrp_inspection,
          material_doc_inspection, posting_date_inspection, inspect, extracted_at
        FROM z_rfc_trck_sernum_postgree
        ${whereSQL}
        ORDER BY tipe ASC, process ASC, serialno ASC
        LIMIT 100 
      `;

      const result = await this.postgresService.query(sql, values);

      return {
        status: 'success',
        total: result.rows.length,
        filters: dto,
        data: result.rows,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Gagal mengeksekusi query getSerialNumber',
        db_error: errorMessage,
      });
    }
  }

  // 2. COUNT DATA SERIAL NUMBER
  async countSerialNumber(dto: CountTrackingDto) {
    try {
      const { whereSQL, values } = this.buildWhereClause(dto);

      const sql = `
        SELECT COUNT(DISTINCT serialno) as total_distinct
        FROM z_rfc_trck_sernum_postgree
        ${whereSQL}
      `;

      const result = await this.postgresService.query(sql, values);

      return {
        status: 'success',
        count: parseInt(result.rows[0].total_distinct),
        filters: dto,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Gagal mengeksekusi query countSerialNumber',
        db_error: errorMessage,
      });
    }
  }

  // 3. LAST UPDATE (MAX EXTRACTED_AT)
  async getLastUpdate(dto: LastUpdateDto) {
    try {
      // Helper buildWhereClause cukup pintar untuk memproses LastUpdateDto
      // yang hanya berisi tipe dan process.
      const { whereSQL, values } = this.buildWhereClause(dto);

      const sql = `
        SELECT MAX(extracted_at) as last_update 
        FROM z_rfc_trck_sernum_postgree
        ${whereSQL}
      `;

      const result = await this.postgresService.query(sql, values);

      return {
        status: 'success',
        last_update: result.rows[0].last_update,
        filters_applied: dto,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Gagal mengeksekusi query getLastUpdate',
        db_error: errorMessage,
      });
    }
  }

  // 4. PERBANDINGAN DATA
  async compareData(dto: CompareTrackingDto) {
    try {
      const promises = dto.comparisons.map(async (item) => {
        const { whereSQL, values } = this.buildWhereClause(item.filter);
        const sql = `
          SELECT COUNT(DISTINCT serialno) as total_distinct
          FROM z_rfc_trck_sernum_postgree
          ${whereSQL}
        `;

        const result = await this.postgresService.query(sql, values);

        return {
          label: item.label,
          total: parseInt(result.rows[0].total_distinct),
          filters_applied: item.filter,
        };
      });

      const comparisonResults = await Promise.all(promises);

      return {
        status: 'success',
        total_groups_compared: comparisonResults.length,
        comparisons: comparisonResults,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Gagal memproses komparasi data',
        db_error: errorMessage,
      });
    }
  }

  private buildWhereClause(dto: any) {
    const whereClauses: string[] = [];
    const values: any[] = [];

    const addCondition = (sql: string, value: any) => {
      values.push(value);
      whereClauses.push(sql.replace('?', `$${values.length}`));
    };

    // 1. Fungsi kecil pembantu untuk membalik tanggal DD-MM-YYYY menjadi YYYY-MM-DD
    const normalizeDate = (dateStr: string) => {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      // Jika formatnya DD-MM-YYYY (bagian terakhir adalah tahun/4 digit)
      if (parts.length === 3 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr; // Kembalikan apa adanya jika formatnya sudah benar
    };

    let tipeResolved = null;
    if (dto.tipe) {
      tipeResolved =
        dto.tipe === 'Semarang & Surabaya'
          ? ['Semarang', 'Surabaya']
          : [dto.tipe];
      addCondition('tipe = ANY(?)', tipeResolved);
    }

    let processResolved = null;
    if (dto.process) {
      // Pastikan process diubah ke Uppercase agar selalu cocok dengan database
      const upperProcess = dto.process.toUpperCase();
      processResolved =
        upperProcess === 'ALL'
          ? ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING']
          : [upperProcess];
      addCondition('process = ANY(?)', processResolved);
    }

    // 2. Terapkan normalizeDate pada semua parameter yang berhubungan dengan tanggal
    if (dto.posting_date)
      addCondition('posting_date = ?', normalizeDate(dto.posting_date));
    if (dto.release_date)
      addCondition('release_date = ?', normalizeDate(dto.release_date));
    if (dto.posting_date_inspection)
      addCondition(
        'posting_date_inspection = ?',
        normalizeDate(dto.posting_date_inspection),
      );

    // Parameter lainnya tetap sama seperti sebelumnya...
    if (dto.serialno) addCondition('serialno = ?', dto.serialno);
    if (dto.so_item) addCondition('so_item = ?', dto.so_item);
    if (dto.process_status)
      addCondition('process_status = ?', dto.process_status);
    if (dto.net_price !== undefined)
      addCondition('net_price = ?', dto.net_price);
    if (dto.standard_price !== undefined)
      addCondition('standard_price = ?', dto.standard_price);
    if (dto.currency) addCondition('currency = ?', dto.currency);
    if (dto.material) addCondition('material = ?', dto.material);
    if (dto.batch) addCondition('batch = ?', dto.batch);
    if (dto.storage) addCondition('storage = ?', dto.storage);
    if (dto.pro) addCondition('pro = ?', dto.pro);
    if (dto.mrp) addCondition('mrp = ?', dto.mrp);
    if (dto.material_doc) addCondition('material_doc = ?', dto.material_doc);
    if (dto.person) addCondition('person = ?', dto.person);
    if (dto.material_inspection)
      addCondition('material_inspection = ?', dto.material_inspection);
    if (dto.batch_inspection)
      addCondition('batch_inspection = ?', dto.batch_inspection);
    if (dto.storage_inspection)
      addCondition('storage_inspection = ?', dto.storage_inspection);
    if (dto.pro_inspection)
      addCondition('pro_inspection = ?', dto.pro_inspection);
    if (dto.mrp_inspection)
      addCondition('mrp_inspection = ?', dto.mrp_inspection);
    if (dto.material_doc_inspection)
      addCondition('material_doc_inspection = ?', dto.material_doc_inspection);
    if (dto.inspect) addCondition('inspect = ?', dto.inspect);

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    return { whereSQL, values };
  }
}
