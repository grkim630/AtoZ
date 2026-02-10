import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client/index";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const enableQueryLog = process.env.DEBUG_PRISMA_QUERY === "true";
    const log: Prisma.LogDefinition[] = enableQueryLog
      ? [
          { level: "query", emit: "stdout" },
          { level: "error", emit: "stdout" },
          { level: "warn", emit: "stdout" },
        ]
      : [
          { level: "error", emit: "stdout" },
          { level: "warn", emit: "stdout" },
        ];

    super({ log });
  }

  async onModuleInit() {
    if (process.env.SKIP_DB_CONNECT === "true") {
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    if (process.env.SKIP_DB_CONNECT === "true") {
      return;
    }
    await this.$disconnect();
  }
}
