import { Test, TestingModule } from '@nestjs/testing';
import {
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserService as DatabaseUserService } from '../database/services/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

// Mock do bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UsersService', (): void => {
  let service: UsersService;
  let databaseUserService: jest.Mocked<DatabaseUserService>;

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password_hash: 'hashed_password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUserResponse = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    created_at: mockUser.created_at,
    updated_at: mockUser.updated_at,
  };

  beforeEach(async (): Promise<void> => {
    const databaseUserServiceMock = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseUserService,
          useValue: databaseUserServiceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    databaseUserService = module.get(DatabaseUserService);
  });

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });

  describe('create', (): void => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a user successfully', async (): Promise<void> => {
      databaseUserService.findByEmail.mockResolvedValue(null);
      databaseUserService.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUserResponse);
      expect(databaseUserService.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(databaseUserService.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password_hash: 'hashed_password',
      });
    });

    it('should throw UnprocessableEntityException if email already exists', async (): Promise<void> => {
      databaseUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', (): void => {
    it('should return an array of users without password_hash', async (): Promise<void> => {
      databaseUserService.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll(0, 10);

      expect(result).toEqual([mockUserResponse]);
      expect(databaseUserService.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('findOne', (): void => {
    it('should return a user without password_hash', async (): Promise<void> => {
      databaseUserService.findById.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUserResponse);
      expect(databaseUserService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async (): Promise<void> => {
      databaseUserService.findById.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', (): void => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
      password: 'newpassword123',
    };

    it('should update a user successfully', async (): Promise<void> => {
      const updatedUser = {
        ...mockUser,
        name: updateUserDto.name ?? mockUser.name,
        email: updateUserDto.email ?? mockUser.email,
        password_hash: 'hashed_password',
      };
      databaseUserService.findById.mockResolvedValue(mockUser);
      databaseUserService.findByEmail.mockResolvedValue(null);
      databaseUserService.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(result).toEqual({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      });
    });

    it('should throw NotFoundException if user not found', async (): Promise<void> => {
      databaseUserService.findById.mockResolvedValue(null);

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnprocessableEntityException if new email is already in use', async (): Promise<void> => {
      databaseUserService.findById.mockResolvedValue(mockUser);
      databaseUserService.findByEmail.mockResolvedValue({
        ...mockUser,
        id: '2',
      });

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('remove', (): void => {
    it('should remove a user successfully', async (): Promise<void> => {
      databaseUserService.findById.mockResolvedValue(mockUser);
      databaseUserService.delete.mockResolvedValue(mockUser);

      const result = await service.remove('1');

      expect(result).toEqual(mockUserResponse);
      expect(databaseUserService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async (): Promise<void> => {
      databaseUserService.findById.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
