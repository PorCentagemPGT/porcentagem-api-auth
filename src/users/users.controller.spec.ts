import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', (): void => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async (): Promise<void> => {
    const mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });

  describe('create', (): void => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a user successfully', async (): Promise<void> => {
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should forward UnprocessableEntityException from service', async (): Promise<void> => {
      service.create.mockRejectedValue(
        new UnprocessableEntityException('Email já está em uso'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async (): Promise<void> => {
      const error = new Error('Unknown error');
      service.create.mockRejectedValue(error);

      try {
        await controller.create(createUserDto);
        fail('should have thrown an error');
      } catch (e: unknown) {
        if (!(e instanceof Error)) throw e;
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Erro ao criar usuário');
      }
    });
  });

  describe('findAll', (): void => {
    it('should return an array of users', async (): Promise<void> => {
      const users = [mockUser];
      service.findAll.mockResolvedValue(users);

      const result = await controller.findAll(0, 10);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(0, 10);
    });

    it('should throw InternalServerErrorException when service fails', async (): Promise<void> => {
      const error = new Error('Database error');
      service.findAll.mockRejectedValue(error);

      try {
        await controller.findAll(0, 10);
        fail('should have thrown an error');
      } catch (e: unknown) {
        if (!(e instanceof Error)) throw e;
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Erro ao listar usuários');
      }
    });
  });

  describe('findOne', (): void => {
    it('should return a user', async (): Promise<void> => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should forward NotFoundException from service', async (): Promise<void> => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException for unknown errors', async (): Promise<void> => {
      const error = new Error('Unknown error');
      service.findOne.mockRejectedValue(error);

      try {
        await controller.findOne('1');
        fail('should have thrown an error');
      } catch (e: unknown) {
        if (!(e instanceof Error)) throw e;
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Erro ao buscar usuário');
      }
    });
  });

  describe('update', (): void => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    const updatedUser = {
      ...mockUser,
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update a user successfully', async (): Promise<void> => {
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should forward NotFoundException from service', async (): Promise<void> => {
      service.update.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should forward UnprocessableEntityException from service', async (): Promise<void> => {
      service.update.mockRejectedValue(
        new UnprocessableEntityException('Email já está em uso'),
      );

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async (): Promise<void> => {
      const error = new Error('Unknown error');
      service.update.mockRejectedValue(error);

      try {
        await controller.update('1', updateUserDto);
        fail('should have thrown an error');
      } catch (e: unknown) {
        if (!(e instanceof Error)) throw e;
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Erro ao atualizar usuário');
      }
    });
  });

  describe('remove', (): void => {
    it('should remove a user successfully', async (): Promise<void> => {
      service.remove.mockResolvedValue(mockUser);

      const result = await controller.remove('1');

      expect(result).toEqual(mockUser);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should forward NotFoundException from service', async (): Promise<void> => {
      service.remove.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException for unknown errors', async (): Promise<void> => {
      const error = new Error('Unknown error');
      service.remove.mockRejectedValue(error);

      try {
        await controller.remove('1');
        fail('should have thrown an error');
      } catch (e: unknown) {
        if (!(e instanceof Error)) throw e;
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('Erro ao remover usuário');
      }
    });
  });
});
