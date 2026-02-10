import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionLoggingFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionLoggingFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId =
      (request.headers['x-request-id'] as string | undefined) ?? 'unknown';

    if (response.headersSent) {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: unknown } | null)?.message ??
          (exception instanceof Error
            ? exception.message
            : 'Internal server error'));

    const stack = exception instanceof Error ? exception.stack : undefined;
    this.logger.error(
      `[${requestId}] ${request.method} ${request.originalUrl} -> ${status} ${String(message)}`,
      stack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
      message,
      requestId,
    });
  }
}
