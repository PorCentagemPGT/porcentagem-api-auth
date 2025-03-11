import { ApiProperty } from '@nestjs/swagger';

export class UserResponseSchema {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2025-03-10T13:24:18.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Data da última atualização do usuário',
    example: '2025-03-10T13:24:18.000Z',
  })
  updated_at: Date;
}
