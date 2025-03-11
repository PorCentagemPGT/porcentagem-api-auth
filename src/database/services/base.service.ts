import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

type TransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

type PrismaErrorCode =
  | 'P1001' // Error querying the database
  | 'P1002' // Error connecting to the database
  | 'P1008' // Operations timed out
  | 'P1017' // Server closed the connection
  | 'P2024'; // Connection pool timeout

interface PrismaError extends Error {
  code?: PrismaErrorCode;
}

@Injectable()
export abstract class BaseService {
  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Executa operações dentro de uma transação
   * @param fn Função a ser executada dentro da transação
   * @returns Resultado da função
   */
  protected async executeInTransaction<T>(
    fn: (tx: TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  /**
   * Executa uma operação com retry em caso de falha de conexão
   * @param operation Operação a ser executada
   * @param maxRetries Número máximo de tentativas
   * @returns Resultado da operação
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let lastError: PrismaError = new Error('Operation failed') as PrismaError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as PrismaError;

        if (!this.isRetryableError(lastError) || attempt === maxRetries) {
          throw error;
        }

        await this.delay(Math.min(100 * Math.pow(2, attempt), 1000));
      }
    }

    throw lastError;
  }

  /**
   * Verifica se um erro pode ser retentado
   * @param error Erro a ser verificado
   * @returns true se o erro pode ser retentado
   */
  private isRetryableError(error: PrismaError): boolean {
    const retryableCodes: PrismaErrorCode[] = [
      'P1001',
      'P1002',
      'P1008',
      'P1017',
      'P2024',
    ];

    return error.code !== undefined && retryableCodes.includes(error.code);
  }

  /**
   * Delay para retry
   * @param ms Milissegundos
   * @returns Promise que resolve após o delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
