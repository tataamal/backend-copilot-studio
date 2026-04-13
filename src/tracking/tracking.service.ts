import { Injectable } from '@nestjs/common';
import { TrackingDto } from './tracking.dto';
import { PostgresService } from '../database/postgres/postgres.service';

@Injectable()
export class TrackingService {
  constructor(private readonly postgresService: PostgresService) {}

  async getSerialNumber(dto: TrackingDto) {
    const whereClauses: string[] = [];
    const values: any[] = [];

    const addCondition = (sql: string, value: any) => {
      values.push(value);
      whereClauses.push(sql.replace('?', `$${values.length}`));
    };

    // 1. Handle tipe secara dinamis jika ada
    let tipeResolved = null;
    if (dto.tipe) {
      tipeResolved =
        dto.tipe === 'Semarang & Surabaya'
          ? ['Semarang', 'Surabaya']
          : [dto.tipe];
      addCondition('tipe = ANY(?)', tipeResolved);
    }

    // 2. Handle process secara dinamis jika ada
    let processResolved = null;
    if (dto.process) {
      processResolved =
        dto.process === 'ALL'
          ? ['ASSY', 'PAINTING', 'PACKING', 'BLEACHING']
          : [dto.process];
      addCondition('process = ANY(?)', processResolved);
    }

    // Mapping parameter opsional lainnya
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
    if (dto.bagian_file) addCondition('bagian_file = ?', dto.bagian_file);

    // 3. Amankan sintaks SQL (Jika tidak ada filter, hilangkan klausa WHERE)
    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT
        serialno,
        so_item,
        tipe,
        net_price,
        standard_price,
        currency,
        process_status,
        process_step,
        process,
        process_row_step,
        material,
        batch,
        storage,
        pro,
        mrp,
        material_doc,
        posting_date,
        release_date,
        person,
        material_inspection,
        batch_inspection,
        storage_inspection,
        pro_inspection,
        mrp_inspection,
        material_doc_inspection,
        posting_date_inspection,
        inspect,
        bagian_file,
        extracted_at
      FROM z_rfc_trck_sernum_postgree
      ${whereSQL}
      ORDER BY tipe ASC, process ASC, serialno ASC
      LIMIT 100 -- Sangat disarankan menambahkan limit default agar database tidak ddos jika query kosong
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
}
