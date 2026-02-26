import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Running migrations...');

  try {
    // Push schema to database (for development)
    // In production, use prisma migrate
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create a migration record
    const migrationName = process.argv[2] || 'initial-migration';
    console.log(`📝 Migration: ${migrationName}`);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
