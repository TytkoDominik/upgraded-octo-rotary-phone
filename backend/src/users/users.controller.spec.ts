import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockUser = (): User => ({
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  createdAt: new Date(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<Pick<UsersService, 'create' | 'importFromCsv'>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      importFromCsv: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get(UsersController);
  });

  describe('create', () => {
    it('delegates dto to service and returns user', async () => {
      const dto = { username: 'alice', email: 'alice@example.com' };
      service.create.mockResolvedValue(mockUser());

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.username).toBe('alice');
    });
  });

  describe('importCsv', () => {
    it('passes file buffer to service and returns result', async () => {
      const file = { buffer: Buffer.from('username,email\nalice,alice@test.com') } as Express.Multer.File;
      service.importFromCsv.mockResolvedValue({ created: 1, failed: [] });

      const result = await controller.importCsv(file);

      expect(service.importFromCsv).toHaveBeenCalledWith(file.buffer);
      expect(result.created).toBe(1);
    });
  });
});
