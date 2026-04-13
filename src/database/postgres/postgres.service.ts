import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL belum diset');
    }

    this.pool = new Pool({
      connectionString,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: Number(process.env.DB_POOL_MAX ?? '10'),
      idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT ?? '30000'),
      connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT ?? '5000'),
    });

    this.pool.on('error', (err) => {
      this.logger.error(
        `Unexpected PostgreSQL pool error: ${err.message}`,
        err.stack,
      );
    });
  }

  async onModuleInit(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      this.logger.log('PostgreSQL connected successfully');
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T = any>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }
}
