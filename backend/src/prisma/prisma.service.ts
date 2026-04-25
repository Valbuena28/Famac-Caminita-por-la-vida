import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Create the connection pool with your URL from .env
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    
    // 2. Create the adapter for PostgreSQL (cast pool to any to fix TS @types/pg mismatch)
    const adapter = new PrismaPg(pool as any);
    
    // 3. Init Prisma with the adapter
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
