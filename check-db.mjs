import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  console.log("--- REGISTRATIONS ---");
  const regs = await prisma.registration.findMany();
  console.log("Registrations count:", regs.length, regs);

  console.log("--- EMPLOYEES ---");
  const emps = await prisma.employee.findMany({
    select: { id: true, email: true, firstName: true, lastName: true }
  });
  console.log("Employees count:", emps.length, emps);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
