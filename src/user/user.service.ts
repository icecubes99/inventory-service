import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client'; // Prisma import removed as it's handled globally
import { handlePrismaError } from '../common/utils/prisma-error-handler';

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
      handlePrismaError(error);
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
      handlePrismaError(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      handlePrismaError(error);
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
      handlePrismaError(error);
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
      handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<User> {
    try {
      await this.findOne(id);
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
