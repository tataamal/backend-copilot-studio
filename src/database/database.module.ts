import { Global, Module } from '@nestjs/common';
// Perhatikan tambahan /fabric di path import ini:
import { FabricService } from './fabric/fabric.service';

@Global()
@Module({
  providers: [FabricService],
  exports: [FabricService],
})
export class DatabaseModule {}
