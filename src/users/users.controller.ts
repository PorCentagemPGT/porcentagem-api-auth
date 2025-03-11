import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  getSchemaPath,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { UserResponseSchema } from './schemas/user-response.schema';

type UserResponse = Omit<User, 'password_hash'>;

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description:
      'Cria um novo usuário no sistema. O email deve ser único e a senha deve ter no mínimo 8 caracteres.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Dados do usuário a ser criado',
    examples: {
      default: {
        value: {
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'senha123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseSchema,
  })
  @ApiResponse({
    status: 422,
    description: 'Email já está em uso',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuários',
    description:
      'Retorna uma lista paginada de usuários. Por padrão, retorna os primeiros 10 usuários.',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Número de registros para pular',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    description: 'Número de registros para retornar',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(UserResponseSchema) },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ): Promise<UserResponse[]> {
    try {
      return await this.usersService.findAll(skip, take);
    } catch {
      throw new InternalServerErrorException('Erro ao listar usuários');
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Retorna os dados de um usuário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    type: UserResponseSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    try {
      return await this.usersService.findOne(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao buscar usuário');
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza os dados de um usuário específico. Todos os campos são opcionais.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Dados do usuário a serem atualizados',
    examples: {
      default: {
        value: {
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'nova_senha123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: UserResponseSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 422,
    description: 'Email já está em uso',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao atualizar usuário');
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover usuário',
    description:
      'Remove um usuário do sistema. Esta operação não pode ser desfeita.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso',
    type: UserResponseSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async remove(@Param('id') id: string): Promise<UserResponse> {
    try {
      return await this.usersService.remove(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao remover usuário');
    }
  }
}
