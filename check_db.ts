import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.registration.findFirst({
    where: {
      firstName: 'WILSON',
      lastName: 'WILLIAM'
    }
  })
  console.log('Registration:', user)

  const emp = await prisma.employee.findFirst({
    where: {
      firstName: 'WILSON',
      lastName: 'WILLIAM'
    }
  })
  console.log('Employee:', emp)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
