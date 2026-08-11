import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const permissions = [
  { name: "view_employees", label: "View Employees", module: "Employees", description: "Allows viewing the list of employees" },
  { name: "manage_employees", label: "Manage Employees", module: "Employees", description: "Allows adding, editing, and deleting employees" },
  { name: "view_files", label: "View Files", module: "Files", description: "Allows viewing files in the file manager" },
  { name: "manage_files", label: "Manage Files", module: "Files", description: "Allows uploading and deleting files" },
  { name: "manage_roles", label: "Manage Roles", module: "System", description: "Allows creating and editing roles" },
  { name: "manage_settings", label: "Manage Settings", module: "System", description: "Allows modifying system settings" },
];

async function main() {
  console.log("Seeding permissions...");
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
