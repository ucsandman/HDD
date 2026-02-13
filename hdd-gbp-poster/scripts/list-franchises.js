const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const franchises = await prisma.franchise.findMany()
  console.log('Existing Franchises:', JSON.stringify(franchises, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
