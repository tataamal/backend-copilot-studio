import { Injectable } from '@nestjs/common';
import { GetTrackingDto } from '../dtos/get-tracking.dto';
import { CountTrackingDto } from '../dtos/count-tracking.dto';
import { CompareTrackingDto } from '../dtos/compare-tracking.dto';
import { LastUpdateDto } from '../dtos/last-update.dto';
import { PostgresService } from '../../database/postgres/postgres.service';

@Injectable()
export class TrackingService {
  constructor(private readonly postgresService: PostgresService) {}

  async getSerialNumber(dto: GetTrackingDto) {
    const whereClauses: string[] = [];
    const values: any[] = [];

    const addCondition = (sql: string, value: any) => {
      values.push(value);
      whereClauses.push(sql.replace('?', `$${values.length}`));
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
      processResolved =
        dto.process === 'ALL'
          ? ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING']
          : [dto.process];
      addCondition('process = ANY(?)', processResolved);
    }

    if (dto.posting_date) addCondition('posting_date = ?', dto.posting_date);
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
    if (dto.release_date) addCondition('release_date = ?', dto.release_date);
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
      filters: {
        ...dto,
        tipe_resolved: tipeResolved,
        process_resolved: processResolved,
      },
      data: result.rows,
    };
  }

  async countSerialNumber(dto: CountTrackingDto) {
    // Kita panggil logika filter yang sama dengan getSerialNumber tapi ganti SELECT-nya
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
  }

  // 2. LAST UPDATE (MAX EXTRACTED_AT)
  async getLastUpdate(dto: LastUpdateDto) {
    const whereClauses: string[] = [];
    const values: any[] = [];

    // Logika filter sederhana untuk tipe dan process
    if (dto.tipe) {
      const tipeResolved =
        dto.tipe === 'Semarang & Surabaya'
          ? ['Semarang', 'Surabaya']
          : [dto.tipe];
      values.push(tipeResolved);
      whereClauses.push(`tipe = ANY($${values.length})`);
    }

    if (dto.process) {
      const processResolved =
        dto.process === 'ALL'
          ? ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING']
          : [dto.process];
      values.push(processResolved);
      whereClauses.push(`process = ANY($${values.length})`);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

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
  }

  // 3. PERBANDINGAN DATA (BEST PRACTICE)
  async compareData(dto: CompareTrackingDto) {
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
  }
  private buildWhereClause(dto: any) {
    const whereClauses: string[] = [];
    const values: any[] = [];

    const addCondition = (sql: string, value: any) => {
      values.push(value);
      whereClauses.push(sql.replace('?', `$${values.length}`));
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
      processResolved =
        dto.process === 'ALL'
          ? ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING']
          : [dto.process];
      addCondition('process = ANY(?)', processResolved);
    }

    if (dto.posting_date) addCondition('posting_date = ?', dto.posting_date);
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
    if (dto.release_date) addCondition('release_date = ?', dto.release_date);
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
