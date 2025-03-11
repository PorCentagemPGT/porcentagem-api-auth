import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { BaseService } from './base.service';
import { PrismaService } from './prisma.service';

type TransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

@Injectable()
export class UserService extends BaseService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Cria um novo usuário
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.executeWithRetry(() => this.prisma.user.create({ data }));
  }

  /**
   * Busca um usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    return this.executeWithRetry(() =>
      this.prisma.user.findUnique({
        where: { id },
      }),
    );
  }

  /**
   * Busca um usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.executeWithRetry(() =>
      this.prisma.user.findUnique({
        where: { email },
      }),
    );
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.executeWithRetry(() =>
      this.prisma.user.update({
        where: { id },
        data,
      }),
    );
  }

  /**
   * Remove um usuário e suas sessões (usando transação)
   */
  async delete(id: string): Promise<User> {
    return this.executeInTransaction(async (tx: TransactionClient) => {
      // Remove todas as sessões do usuário
      await tx.session.deleteMany({
        where: { user_id: id },
      });

      // Remove o usuário
      return tx.user.delete({
        where: { id },
      });
    });
  }

  /**
   * Lista usuários com paginação
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, orderBy } = params;
    return this.executeWithRetry(() =>
      this.prisma.user.findMany({
        skip,
        take,
        orderBy,
      }),
    );
  }
}
