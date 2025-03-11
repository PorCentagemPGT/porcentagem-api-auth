import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { UserService as DatabaseUserService } from '../database/services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

type UserResponse = Omit<User, 'password_hash'>;

@Injectable()
export class UsersService {
  constructor(private readonly databaseUserService: DatabaseUserService) {}

  /**
   * Remove o campo password_hash do usuário
   */
  private excludePasswordHash = (user: User): UserResponse => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: removed, ...result } = user;
    return result;
  };

  /**
   * Cria um novo usuário
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    // Verifica se já existe um usuário com o mesmo email
    const existingUser = await this.databaseUserService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new UnprocessableEntityException('Email já está em uso');
    }

    // Hash da senha antes de salvar
    const password_hash = await hash(createUserDto.password, 10);

    // Cria o usuário com a senha hasheada
    const user = await this.databaseUserService.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password_hash,
    });

    return this.excludePasswordHash(user);
  }

  /**
   * Lista todos os usuários com paginação
   */
  async findAll(skip: number, take: number): Promise<UserResponse[]> {
    const users = await this.databaseUserService.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
    });

    return users.map(this.excludePasswordHash);
  }

  /**
   * Busca um usuário por ID
   */
  async findOne(id: string): Promise<UserResponse> {
    const user = await this.databaseUserService.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.excludePasswordHash(user);
  }

  /**
   * Atualiza um usuário
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    // Verifica se o usuário existe
    const existingUser = await this.databaseUserService.findById(id);
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se estiver atualizando o email, verifica se já está em uso
    if (updateUserDto.email) {
      const userWithEmail = await this.databaseUserService.findByEmail(
        updateUserDto.email,
      );
      if (userWithEmail && userWithEmail.id !== id) {
        throw new UnprocessableEntityException('Email já está em uso');
      }
    }

    // Prepara os dados para atualização
    const updateData: Prisma.UserUpdateInput = {
      name: updateUserDto.name,
      email: updateUserDto.email,
    };

    // Se estiver atualizando a senha, faz o hash
    if (updateUserDto.password) {
      updateData.password_hash = await hash(updateUserDto.password, 10);
    }

    // Atualiza o usuário
    const user = await this.databaseUserService.update(id, updateData);

    return this.excludePasswordHash(user);
  }

  /**
   * Remove um usuário
   */
  async remove(id: string): Promise<UserResponse> {
    // Verifica se o usuário existe
    const existingUser = await this.databaseUserService.findById(id);
    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Remove o usuário e suas sessões
    const user = await this.databaseUserService.delete(id);

    return this.excludePasswordHash(user);
  }
}
