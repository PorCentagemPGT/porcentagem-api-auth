import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Message confirming successful logout',
    example: 'Logout successful',
  })
  message: string;

  @ApiProperty({
    description: 'ID of the invalidated session',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Timestamp when the logout occurred',
    example: '2025-03-14T15:17:08Z',
  })
  logoutTime: string;
}
