import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          passwordHash: hashedPassword,
          ...rest,
        },
      });

      if (!user) {
        throw new Error('User not created');
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      await this.findOne(id);

      const updateData: any = { ...updateUserDto };

      if (updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        updateData.passwordHash = await bcrypt.hash(
          updateUserDto.password,
          salt,
        );
        delete updateData.password;
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      await this.findOne(id);
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const fieldName = error.meta?.field_name as string | undefined;
      const target = error.meta?.target as string[] | undefined;
      const cause = error.meta?.cause as string | undefined;

      switch (error.code) {
        case 'P2002': {
          const field = target?.[0] ?? 'field';
          throw new ConflictException(`User with this ${field} already exists`);
        }
        case 'P2003':
          throw new BadRequestException(
            `Invalid reference: ${fieldName ?? 'unknown field'}`,
          );
        case 'P2014':
          throw new BadRequestException(
            `Invalid ID: ${fieldName ?? 'unknown field'}`,
          );
        case 'P2015':
          throw new NotFoundException(
            `Related record not found: ${fieldName ?? 'unknown field'}`,
          );
        case 'P2016':
          throw new BadRequestException(
            `Required field missing: ${fieldName ?? 'unknown field'}`,
          );
        case 'P2025':
          throw new NotFoundException(
            `Record not found: ${cause ?? 'unknown cause'}`,
          );
        default:
          throw new InternalServerErrorException(
            `Database error: ${error.message}`,
          );
      }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException(`Validation error: ${error.message}`);
    }
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw new InternalServerErrorException('Database connection error');
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new InternalServerErrorException('Database initialization error');
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      throw new InternalServerErrorException(
        `Unknown database error: ${error.message}`,
      );
    }
    throw error;
  }
}
