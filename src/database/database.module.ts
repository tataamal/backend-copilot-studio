import { Global, Module } from '@nestjs/common';
import { FabricService } from './fabric/fabric.service';
import { PostgresService } from './postgres/postgres.service';

@Global()
@Module({
  providers: [FabricService, PostgresService],
  exports: [FabricService, PostgresService],
})
export class DatabaseModule {}
