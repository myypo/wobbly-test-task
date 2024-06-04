import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { UNIQUE_CONSTRAINT } from '../prisma/prisma.constants';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

  async create(data: Prisma.UserCreateInput): Promise<User | undefined> {
    try {
      const modUser = await this.prisma.user.create({ data });
      return new User(modUser);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === UNIQUE_CONSTRAINT) {
          throw new ConflictException(
            'the provided username is already in use',
          );
        }

        throw e;
      }
    }
  }
}
