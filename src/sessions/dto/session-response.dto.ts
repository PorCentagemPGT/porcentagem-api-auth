import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionResponseDto {
  @ApiProperty({
    description: 'ID da sessão',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Token de refresh',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({ description: 'Data de expiração da sessão' })
  expiresAt: Date;

  @ApiPropertyOptional({
    description: 'Informações do dispositivo',
    example: 'Chrome 98.0.4758.102 on Windows 10',
  })
  deviceInfo?: string;

  @ApiPropertyOptional({ description: 'Endereço IP', example: '192.168.1.1' })
  ipAddress?: string;

  @ApiProperty({
    description: 'Indica se a sessão está bloqueada',
    example: false,
  })
  isBlocked: boolean;

  @ApiProperty({ description: 'Data de criação da sessão' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização da sessão' })
  updatedAt: Date;
}
