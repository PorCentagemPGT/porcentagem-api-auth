import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from '@prisma/client';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(private readonly database: DatabaseService) {}

  /**
   * Cria uma nova sessão para o usuário
   * @param createSessionDto Dados para criar a sessão
   * @returns A sessão criada
   */
  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    this.logger.debug(`Creating session for user ${createSessionDto.userId}`);

    const session = await this.database.session.create({
      data: {
        userId: createSessionDto.userId,
        refreshToken: createSessionDto.refreshToken,
        expiresAt: createSessionDto.expiresAt,
        deviceInfo: createSessionDto.deviceInfo,
        ipAddress: createSessionDto.ipAddress,
      },
    });

    this.logger.debug(
      `Session created for user ${createSessionDto.userId} with ID ${session.id}`,
    );

    return session;
  }

  /**
   * Busca todas as sessões de um usuário
   * @param userId ID do usuário
   * @param isBlocked Opcional, filtra por sessões bloqueadas/não bloqueadas
   * @returns Lista de sessões do usuário
   */
  async findByUser(userId: string, isBlocked?: boolean): Promise<Session[]> {
    this.logger.debug(
      `Finding sessions for user ${userId}${
        isBlocked !== undefined ? ` with isBlocked=${isBlocked}` : ''
      }`,
    );

    const where: { userId: string; isBlocked?: boolean } = { userId };
    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked;
    }

    const sessions = await this.database.session.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (sessions.length === 0) {
      throw new NotFoundException(`No sessions found for user ${userId}`);
    }

    this.logger.debug(`Found ${sessions.length} sessions for user ${userId}`);
    return sessions;
  }
}
