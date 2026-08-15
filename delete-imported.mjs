import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function deleteImported() {
  try {
    const allCount = await prisma.employee.count();
    const importedCount = await prisma.employee.count({
      where: {
        email: {
          startsWith: 'imported-'
        }
      }
    });

    console.log(`Total employees: ${allCount}`);
    console.log(`Imported employees to delete: ${importedCount}`);

    const res = await prisma.employee.deleteMany({
      where: {
        email: {
          startsWith: 'imported-'
        }
      }
    });

    console.log(`Successfully deleted ${res.count} imported employees.`);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

deleteImported();
