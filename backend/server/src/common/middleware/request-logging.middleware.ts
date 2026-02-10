import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = randomUUID();
    const startedAt = Date.now();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    const method = req.method;
    const url = req.originalUrl || req.url;
    this.logger.log(`[${requestId}] -> ${method} ${url}`);

    if (process.env.DEBUG_HTTP_BODY === 'true' && method !== 'GET') {
      this.logger.debug(
        `[${requestId}] request body: ${this.safeStringify(req.body)}`,
      );
    }

    res.on('finish', () => {
      const elapsedMs = Date.now() - startedAt;
      this.logger.log(
        `[${requestId}] <- ${method} ${url} ${res.statusCode} (${elapsedMs}ms)`,
      );
    });

    next();
  }

  private safeStringify(value: unknown) {
    try {
      return JSON.stringify(this.redactSecrets(value));
    } catch {
      return '[unserializable]';
    }
  }

  private redactSecrets(value: unknown): unknown {
    if (!value || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.redactSecrets(item));
    }

    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(src)) {
      const lower = key.toLowerCase();
      if (lower.includes('password') || lower.includes('token')) {
        out[key] = '***';
      } else {
        out[key] = this.redactSecrets(item);
      }
    }
    return out;
  }
}
