import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Cincinnati franchise
  const franchise = await prisma.franchise.upsert({
    where: { slug: 'cincinnati' },
    update: {},
    create: {
      name: 'Hickory Dickory Decks - Cincinnati',
      slug: 'cincinnati',
      timezone: 'America/New_York',
      postsPerWeek: 3,
      preferredPostDays: 'mon,wed,fri',
      preferredPostTime: '09:00',
      contextInfo: `Owners: Nathan and Brinton Ricke (brothers). Located in Cincinnati, Ohio. Service area includes Greater Cincinnati, West Chester, Mason, Loveland, Anderson Township, Blue Ash, and communities across Hamilton, Butler, Warren, and Clermont counties. Specialties: Composite and PVC decking, hot tub decks, pool decks, pergolas, railings, sunrooms. Part of the Hickory Dickory Decks franchise with 35+ years of experience. Phone: 513-572-1200. Email: nricke@decks.ca. Website: https://decks.ca/deck-builders/cincinnati`,
    },
  })

  console.log(`Created franchise: ${franchise.name}`)

  // Create admin user (Nathan)
  const adminUser = await prisma.user.upsert({
    where: { email: 'nricke@decks.ca' },
    update: {},
    create: {
      email: 'nricke@decks.ca',
      name: 'Nathan Ricke',
      role: 'admin',
      franchiseId: franchise.id,
    },
  })

  console.log(`Created admin user: ${adminUser.email}`)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
