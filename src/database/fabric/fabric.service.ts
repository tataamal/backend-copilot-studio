import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class FabricService implements OnModuleDestroy {
  private pool!: sql.ConnectionPool;
  private readonly logger = new Logger(FabricService.name);

  // Inject ConfigService untuk membaca file .env
  constructor(private readonly configService: ConfigService) {}

  async connect() {
    if (this.pool) return this.pool;

    const config: sql.config = {
      server: this.configService.get<string>('FABRIC_SERVER') || '',
      database: this.configService.get<string>('FABRIC_DATABASE') || '',
      authentication: {
        type: 'azure-active-directory-service-principal-secret',
        options: {
          clientId: this.configService.get<string>('FABRIC_CLIENT_ID') || '',
          tenantId: this.configService.get<string>('FABRIC_TENANT_ID') || '',
          clientSecret:
            this.configService.get<string>('FABRIC_CLIENT_SECRET') || '',
        },
      },
      options: {
        encrypt: true,
        trustServerCertificate: false,
        requestTimeout: 30000, // Timeout 30 detik
      },
    };

    try {
      this.logger.log('Mencoba terhubung ke Microsoft Fabric...');
      this.pool = await new sql.ConnectionPool(config).connect();
      this.logger.log('✅ Berhasil koneksi ke Fabric Lakehouse!');
      return this.pool;
    } catch (err) {
      this.logger.error('❌ Gagal koneksi ke Fabric', err);
      throw err;
    }
  }

  async executeQuery(query: string) {
    try {
      const connection = await this.connect();
      this.logger.log(`Menjalankan Query: ${query}`);

      // KODE ASLI: Eksekusi ke database
      const result = await connection.request().query(query);
      return result.recordset;
    } catch (err) {
      this.logger.error('Query execution error:', err);
      throw new Error('Gagal mengambil data dari Lakehouse');
    }
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.close();
  }
}
