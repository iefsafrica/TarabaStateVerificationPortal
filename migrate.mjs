import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Running migrations via SQL...");

  // Create Registration table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Registration" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "registrationNo" TEXT NOT NULL UNIQUE,
      "bvn" TEXT,
      "nin" TEXT,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "middleName" TEXT,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "dateOfBirth" TEXT,
      "gender" TEXT,
      "address" TEXT,
      "department" TEXT,
      "designation" TEXT,
      "employeeId" TEXT,
      "grade" TEXT,
      "dateOfEmployment" TEXT,
      "status" TEXT NOT NULL DEFAULT 'Pending',
      "ninVerified" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✓ Registration table created/verified");

  // Create SystemSettings table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SystemSettings" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "key" TEXT NOT NULL UNIQUE,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✓ SystemSettings table created/verified");

  console.log("Migrations complete!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
