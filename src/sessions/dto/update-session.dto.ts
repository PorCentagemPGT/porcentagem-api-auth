import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @ApiPropertyOptional({
    description: 'Token de refresh',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Data de expiração da sessão',
  })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Informações do dispositivo',
    example: 'Chrome 98.0.4758.102 on Windows 10',
  })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @ApiPropertyOptional({
    description: 'Endereço IP',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Indica se a sessão está bloqueada',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
