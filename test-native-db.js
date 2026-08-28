require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.employee.findMany()
  .then(e => console.log('Rows:', e.length))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
