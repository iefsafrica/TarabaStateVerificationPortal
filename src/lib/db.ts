import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const prismaClientSingleton = () => {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 20000,
    max: 10
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaV2: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaV2 ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaV2 = prisma
