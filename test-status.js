const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const emps = await prisma.employee.findMany({select: {status: true}}); 
  console.log(emps); 
  await prisma.$disconnect(); 
} 
main();
