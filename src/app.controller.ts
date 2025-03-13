import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * Controlador principal da API de autenticação
 */
@ApiTags('Status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint para verificar o status da API
   */
  @Get()
  @ApiOperation({
    summary: 'Status da API',
    description: 'Retorna uma mensagem indicando que a API está funcionando',
  })
  @ApiResponse({
    status: 200,
    description: 'API funcionando corretamente',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
