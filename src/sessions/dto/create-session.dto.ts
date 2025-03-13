import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Token de refresh',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'Data de expiração da sessão',
  })
  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;

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
}
