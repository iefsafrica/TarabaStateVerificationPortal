import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function deleteAll() {
  try {
    const res = await prisma.employee.deleteMany({});
    console.log(`Successfully deleted all ${res.count} employees.`);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

deleteAll();
