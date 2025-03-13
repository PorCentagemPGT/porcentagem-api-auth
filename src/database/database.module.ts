import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Módulo global para acesso ao banco de dados
 * Este é o único módulo que deve ter acesso direto ao Prisma
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
