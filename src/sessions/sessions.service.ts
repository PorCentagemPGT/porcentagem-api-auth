import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Session } from '@prisma/client';
import { CreateSessionDto } from './dto/create-session.dto';

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
    this.logger.log(
      `Session creation started - userId: ${createSessionDto.userId}`,
    );

    const session = await this.database.session.create({
      data: createSessionDto,
    });

    this.logger.log(`Session created successfully - id: ${session.id}`);

    return session;
  }

  /**
   * Busca todas as sessões de um usuário
   * @param userId ID do usuário
   * @param isBlocked Opcional, filtra por sessões bloqueadas/não bloqueadas
   * @returns Lista de sessões do usuário
   */
  async findByUser(userId: string, isBlocked?: boolean): Promise<Session[]> {
    this.logger.log(`Finding sessions for user ${userId}`);

    const sessions = await this.database.session.findMany({
      where: {
        userId,
        ...(isBlocked !== undefined && { isBlocked }),
      },
    });

    this.logger.log(`Found ${sessions.length} sessions for user ${userId}`);

    return sessions;
  }

  /**
   * Invalida todas as sessões ativas de um usuário
   * @param userId ID do usuário
   * @returns A última sessão invalidada
   * @internal Método de uso interno, utilizado apenas pelo AuthService
   */
  public async invalidateByUserId(userId: string): Promise<Session> {
    this.logger.log('Session invalidation by userId started');

    // Busca a sessão mais recente do usuário que ainda é válida
    const session = await this.database.session.findFirst({
      where: {
        userId,
        isValid: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session) {
      this.logger.warn(`No active session found for user ${userId}`);
      throw new NotFoundException('Session not found or already invalidated');
    }

    // Invalida todas as sessões do usuário
    await this.database.session.updateMany({
      where: {
        userId,
        isValid: true,
      },
      data: {
        isValid: false,
        invalidatedAt: new Date(),
      },
    });

    const invalidatedSession = await this.database.session.findUniqueOrThrow({
      where: { id: session.id },
    });

    this.logger.log(`Sessions invalidated successfully for user ${userId}`);

    return invalidatedSession;
  }
}
