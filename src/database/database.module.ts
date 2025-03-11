import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { UserService } from './services/user.service';
import { SessionService } from './services/session.service';

@Global()
@Module({
  providers: [PrismaService, UserService, SessionService],
  exports: [PrismaService, UserService, SessionService],
})
export class DatabaseModule {}
