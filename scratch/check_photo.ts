import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findUnique({
    where: { id: "6e3ef839-4444-4b53-a4e7-a9a3b6f2d292" } // EMP-6E3EF839 -> need to find by NIN 72807531744
  });
  console.log("Found by ID?", !!emp);
  
  const emp2 = await prisma.employee.findFirst({
    where: { nin: "72807531744" }
  });
  console.log("Photo is present?", !!emp2?.photo, emp2?.photo?.substring(0, 50));
}

main().finally(() => prisma.$disconnect());
