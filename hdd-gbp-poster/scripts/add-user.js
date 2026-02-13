const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const franchiseId = '8bc0cf02-2cf9-4e5d-9f97-59c69c48be42'
  const email = 'wes.sander.uc@gmail.com'
  
  const user = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      email: email,
      name: 'Wes Sander',
      role: 'admin',
      franchiseId: franchiseId
    }
  })
  
  console.log('Successfully created/updated user:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
