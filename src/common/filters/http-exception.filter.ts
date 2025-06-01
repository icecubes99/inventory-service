import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Log the error for debugging
    this.logger.error(
      `HTTP Exception: ${exception.message}`,
      exception.stack,
      `${request.method} ${request.url}`,
    );

    // Handle different types of exception responses
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any)?.message || 'An error occurred',
      error:
        typeof exceptionResponse === 'string'
          ? HttpStatus[status]
          : (exceptionResponse as any)?.error || HttpStatus[status],
    };

    // Add validation errors if present
    if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as any)?.message &&
      Array.isArray((exceptionResponse as any).message)
    ) {
      errorResponse.message = (exceptionResponse as any).message;
    }

    response.status(status).json(errorResponse);
  }
}
