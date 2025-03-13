import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

/**
 * Decorator que configura a documentação Swagger para endpoints protegidos por JWT
 * @returns Decorators combinados para autenticação Bearer
 */
export function ApiBearerAuthWithDocs() {
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({
      description: 'Token não fornecido, expirado ou inválido',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 401,
          },
          message: {
            type: 'string',
            example: 'Token não fornecido ou formato inválido',
          },
          error: {
            type: 'string',
            example: 'Unauthorized',
          },
        },
      },
    }),
  );
}
