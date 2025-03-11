import { Injectable } from '@nestjs/common';
import { Session, Prisma } from '@prisma/client';
import { BaseService } from './base.service';
import { PrismaService } from './prisma.service';

@Injectable()
export class SessionService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Cria uma nova sessão
   */
  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    return this.executeWithRetry(() => this.prisma.session.create({ data }));
  }

  /**
   * Busca uma sessão por refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.executeWithRetry(() =>
      this.prisma.session.findUnique({
        where: { refresh_token: refreshToken },
        include: { user: true },
      }),
    );
  }

  /**
   * Remove uma sessão específica
   */
  async delete(id: string): Promise<Session> {
    return this.executeWithRetry(() =>
      this.prisma.session.delete({
        where: { id },
      }),
    );
  }

  /**
   * Remove todas as sessões de um usuário
   */
  async deleteAllUserSessions(userId: string): Promise<Prisma.BatchPayload> {
    return this.executeWithRetry(() =>
      this.prisma.session.deleteMany({
        where: { user_id: userId },
      }),
    );
  }

  /**
   * Remove sessões expiradas
   */
  async cleanExpiredSessions(): Promise<Prisma.BatchPayload> {
    return this.executeWithRetry(() =>
      this.prisma.session.deleteMany({
        where: {
          expires_at: {
            lt: new Date(),
          },
        },
      }),
    );
  }

  /**
   * Lista todas as sessões ativas de um usuário
   */
  async findUserActiveSessions(userId: string): Promise<Session[]> {
    return this.executeWithRetry(() =>
      this.prisma.session.findMany({
        where: {
          user_id: userId,
          expires_at: {
            gt: new Date(),
          },
        },
      }),
    );
  }
}
