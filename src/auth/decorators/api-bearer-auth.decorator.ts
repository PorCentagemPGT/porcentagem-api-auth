import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiBearerAuthWithDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: `Acesso não autorizado. Razões possíveis:
        - Token ausente no header Authorization
        - Token inválido ou mal formatado
        - Token expirado (use /auth/refresh para obter um novo)`,
    }),
  );
}
