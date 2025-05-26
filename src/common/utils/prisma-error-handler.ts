import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
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
