import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

type MockRepo = jest.Mocked<Pick<Repository<User>, 'save'>>;

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  createdAt: new Date(),
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = { save: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('saves dto and returns user', async () => {
      const dto = { username: 'alice', email: 'alice@example.com' };
      repo.save.mockResolvedValue(mockUser());

      const result = await service.create(dto);

      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result.username).toBe('alice');
    });

    it('throws ConflictException on duplicate', async () => {
      const dupError = Object.assign(new Error('UNIQUE constraint failed'), { code: 'SQLITE_CONSTRAINT' });
      repo.save.mockRejectedValue(dupError);

      await expect(
        service.create({ username: 'alice', email: 'alice@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('rethrows non-duplicate errors', async () => {
      const dbError = Object.assign(new Error('Connection failed'), { code: 'SQLITE_ERROR' });
      repo.save.mockRejectedValue(dbError);

      await expect(
        service.create({ username: 'alice', email: 'alice@example.com' }),
      ).rejects.toThrow('Connection failed');
    });
  });

  describe('importFromCsv', () => {
    it('saves all valid rows and returns created count', async () => {
      const csv = Buffer.from('username,email\nalice,alice@example.com\nbob,bob@example.com');
      repo.save.mockImplementation(async (u) => mockUser({ username: u.username, email: u.email }));

      const result = await service.importFromCsv(csv);

      expect(repo.save).toHaveBeenCalledTimes(2);
      expect(result.created).toBe(2);
      expect(result.failed).toHaveLength(0);
    });

    it('skips rows with missing username and reports error', async () => {
      const csv = Buffer.from('username,email\n,notanemail\nbob,bob@example.com');
      repo.save.mockImplementation(async (u) => mockUser({ username: u.username, email: u.email }));

      const result = await service.importFromCsv(csv);

      expect(result.created).toBe(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].row).toBe(1);
      expect(result.failed[0].errors.length).toBeGreaterThan(0);
    });

    it('skips rows with invalid email and reports error', async () => {
      const csv = Buffer.from('username,email\nalice,not-an-email');
      repo.save.mockImplementation(async (u) => mockUser({ username: u.username, email: u.email }));

      const result = await service.importFromCsv(csv);

      expect(result.created).toBe(0);
      expect(result.failed[0].email).toBe('not-an-email');
    });

    it('counts duplicate row as failure without throwing', async () => {
      const csv = Buffer.from('username,email\nalice,alice@example.com\nalice,alice@example.com');
      repo.save
        .mockResolvedValueOnce(mockUser())
        .mockRejectedValueOnce(new Error('UNIQUE constraint failed'));

      const result = await service.importFromCsv(csv);

      expect(result.created).toBe(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].errors[0]).toMatch(/duplicate/i);
    });
  });
});
