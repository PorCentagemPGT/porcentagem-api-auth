import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenDto {
  @ApiProperty({
    description: 'ID do usuário dono do token',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  userId: string;

  @ApiProperty({
    description: 'Indica se o token é válido',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Tempo restante de validade do token em segundos',
    example: 900,
  })
  expiresIn: number;
}
