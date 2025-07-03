// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

// Mock the external dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verify_token', () => {
    it('should return payload for valid token', () => {
      const mockPayload = { sub: 123 };
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = service.verify_token('valid-token');
      expect(result).toEqual(mockPayload);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    });

    it('should throw HttpException for expired token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw { name: 'TokenExpiredError' };
      });

      expect(() => service.verify_token('expired-token')).toThrow(HttpException);
      expect(() => service.verify_token('expired-token')).toThrow('token expired');
    });

    it('should throw HttpException for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verify_token('invalid-token')).toThrow(HttpException);
      expect(() => service.verify_token('invalid-token')).toThrow('wrong token');
    });
  });

  describe('sign_jwt', () => {
    it('should sign a JWT with correct parameters', async () => {
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const result = await service.sign_jwt(123, '1h');
      expect(result).toBe('signed-token');
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 123 },
        'test-secret',
        { expiresIn: '1h' }
      );
    });
  });

  describe('comparePasswordsLogin', () => {
    it('should return true for matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.comparePasswordsLogin('password', 'hashed-password');
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
    });

    it('should return false for non-matching passwords', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.comparePasswordsLogin('password', 'wrong-hash');
      expect(result).toBe(false);
    });
  });

  describe('hash_password', () => {
    it('should return hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.hash_password('password', 10);
      expect(result).toBe('hashed-password');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });
  });
});