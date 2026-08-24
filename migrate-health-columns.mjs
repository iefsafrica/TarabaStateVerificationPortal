import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const newColumns = [
  // Ministry
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "ministry" TEXT`,

  // Health Facilities - Personal
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "maidenName" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "areYouNigerian" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "senatoralWardOfOrigin" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "wardOfOrigin" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "country" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "mobileNo" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "permanentAddress" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "permanentState" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "permanentLga" TEXT`,

  // Education
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "dateOfGraduation" TEXT`,

  // Health Professional Registration
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "mdcnRegNo" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "professionalRegBody" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "professionalRegNo" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "licenseIssuanceDate" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "nurseSpecialization" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "practitionerType" TEXT`,

  // Health Facility Appointment
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "appointmentType" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "presentPosting" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "dateOfConfirmation" TIMESTAMP(3)`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "dateOfPresentAppointment" TIMESTAMP(3)`,

  // Facility Info
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "facilityName" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "facilityType" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "branch" TEXT`,

  // Submission / Import Metadata
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "submissionId" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "validationStatus" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "importNotes" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "importSource" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "importVersion" TEXT`,
  `ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "importTags" TEXT`,
];

async function main() {
  console.log('Running migration: adding new columns to Employee table...');

  for (const sql of newColumns) {
    const match = sql.match(/"([a-zA-Z]+)"\s+(TEXT|TIMESTAMP)/);
    const colName = match ? match[1] : sql.substring(0, 60);
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('  OK ' + colName);
    } catch (err) {
      console.error('  FAIL ' + colName + ': ' + err.message);
    }
  }

  console.log('Migration complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
