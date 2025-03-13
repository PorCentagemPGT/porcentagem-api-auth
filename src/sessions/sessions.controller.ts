import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from '@prisma/client';
import {
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiParam,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';

class SessionEntity implements Session {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo: string | null;
  ipAddress: string | null;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@ApiTags('Session')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new session',
    description: 'Creates a new session for a user.',
  })
  @ApiCreatedResponse({
    description: 'The session has been successfully created.',
    type: SessionEntity,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input (validation failed).',
  })
  async create(@Body() createSessionDto: CreateSessionDto): Promise<Session> {
    return await this.sessionsService.create(createSessionDto);
  }

  @Get(':userId')
  @ApiOperation({
    summary: 'List user sessions',
    description: 'Lists all active sessions for a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user to list sessions for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'isBlocked',
    required: false,
    type: Boolean,
    description: 'Filter sessions by blocked status',
  })
  @ApiOkResponse({
    description: 'List of sessions for the user.',
    type: [SessionEntity],
  })
  @ApiNotFoundResponse({
    description: 'No sessions found for the user.',
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query('isBlocked') isBlocked?: boolean,
  ): Promise<Session[]> {
    return await this.sessionsService.findByUser(userId, isBlocked);
  }
}
