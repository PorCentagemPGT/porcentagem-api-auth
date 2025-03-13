import { Injectable } from '@nestjs/common';

/**
 * Serviço principal da API de autenticação do PorCentagem
 * Responsável por fornecer informações básicas sobre o serviço
 */
@Injectable()
export class AppService {
  /**
   * Retorna uma mensagem de status da API
   * @returns Mensagem indicando que a API está funcionando
   */
  getHello(): string {
    return 'PorCentagem Auth API - Serviço de Autenticação';
  }
}
