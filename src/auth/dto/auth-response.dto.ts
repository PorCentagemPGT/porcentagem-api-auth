import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels()
export class JwtPayload {
  @ApiProperty({
    description: 'ID do usuário (subject)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sub: string;

  @ApiProperty({
    description: 'Timestamp de quando o token foi emitido',
    example: 1615910400,
  })
  iat: number;

  @ApiProperty({
    description: 'Timestamp de quando o token expira',
    example: 1615911300,
  })
  exp: number;
}

export class AuthResponseDto {
  @ApiProperty({
    description: `Token de acesso JWT para autenticação.
      Deve ser enviado no header Authorization de todas as requisições.
      Formato: Bearer {token}
      Tempo de vida: 15 minutos
      
      Estrutura do payload decodificado:
      {
        "sub": "123e4567-e89b-12d3-a456-426614174000",
        "iat": 1615910400,
        "exp": 1615911300
      }`,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc',
  })
  accessToken: string;

  @ApiProperty({
    description: `Token de refresh para obter novo access token.
      Deve ser armazenado de forma segura pelo cliente.
      Usado apenas no endpoint /auth/refresh.
      Tempo de vida: 7 dias`,
    example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tempo em segundos até o access token expirar',
    example: 900, // 15 minutos
    minimum: 1,
  })
  expiresIn: number;
}
