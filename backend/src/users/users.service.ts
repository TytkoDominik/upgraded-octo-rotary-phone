import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { parse } from 'csv-parse/sync';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ImportResultDto, FailedRow } from './dto/import-result.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      return await this.users.save(dto);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException('Username or email already exists');
      }
      throw err;
    }
  }

  async importFromCsv(buffer: Buffer): Promise<ImportResultDto> {
    const records: { username: string; email: string }[] = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let created = 0;
    const failed: FailedRow[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const dto = plainToInstance(CreateUserDto, record);
      const errors = await validate(dto);

      if (errors.length > 0) {
        failed.push({
          row: i + 1,
          username: record.username ?? '',
          email: record.email ?? '',
          errors: errors.flatMap((e) => Object.values(e.constraints ?? {})),
        });
        continue;
      }

      try {
        await this.users.save(dto);
        created++;
      } catch {
        failed.push({
          row: i + 1,
          username: record.username,
          email: record.email,
          errors: ['Duplicate username or email'],
        });
      }
    }

    return { created, failed };
  }
}
