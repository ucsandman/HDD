import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Demo IDs - VALID UUIDs (hex only)
const DEMO_FRANCHISE_ID = 'd3000000-0000-0000-0000-000000000001'
const DEMO_USER_ID = 'd3000000-0000-0000-0000-000000000002'

// Image IDs (deterministic valid UUIDs)
const IMAGE_IDS = [
  'd3000000-1000-0000-0000-000000000001',
  'd3000000-1000-0000-0000-000000000002',
  'd3000000-1000-0000-0000-000000000003',
  'd3000000-1000-0000-0000-000000000004',
  'd3000000-1000-0000-0000-000000000005',
  'd3000000-1000-0000-0000-000000000006',
]

// Post IDs (deterministic valid UUIDs)
const POST_IDS = [
  'd3000000-2000-0000-0000-000000000001',
  'd3000000-2000-0000-0000-000000000002',
  'd3000000-2000-0000-0000-000000000003',
  'd3000000-2000-0000-0000-000000000004',
  'd3000000-2000-0000-0000-000000000005',
  'd3000000-2000-0000-0000-000000000006',
  'd3000000-2000-0000-0000-000000000007',
  'd3000000-2000-0000-0000-000000000008',
]

async function main() {
  console.log('Seeding demo database...')

  // Create Cincinnati franchise with mock Google connection
  const franchise = await prisma.franchise.upsert({
    where: { slug: 'cincinnati' },
    update: {
      // Ensure ID matches demo ID if we're updating
      id: DEMO_FRANCHISE_ID
    },
    create: {
      id: DEMO_FRANCHISE_ID,
      name: 'Hickory Dickory Decks - Cincinnati',
      slug: 'cincinnati',
      timezone: 'America/New_York',
      postsPerWeek: 3,
      preferredPostDays: 'mon,wed,fri',
      preferredPostTime: '09:00',
      // Mock Google connection for demo
      googleAccountId: 'demo-account-123',
      googleLocationId: 'demo-location-456',
      googleAccessToken: 'demo-token-encrypted',
      googleRefreshToken: 'demo-refresh-encrypted',
      googleTokenExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      contextInfo: `Owners: Nathan and Brinton Ricke (brothers). Located in Cincinnati, Ohio.

Service area includes Greater Cincinnati, West Chester, Mason, Loveland, Anderson Township, Blue Ash, Montgomery, and communities across Hamilton, Butler, Warren, and Clermont counties.

Specialties: Composite and PVC decking (Trex Transcend, TimberTech AZEK), hot tub decks, pool decks, pergolas, railings, sunrooms, screen rooms.

Part of the Hickory Dickory Decks franchise with 35+ years of experience. We focus on premium, low-maintenance outdoor living solutions.

Phone: 513-572-1200
Email: nricke@decks.ca
Website: https://decks.ca/deck-builders/cincinnati`,
    },
  })

  console.log(`Created franchise: ${franchise.name}`)

  // Create admin user (Nathan)
  const adminUser = await prisma.user.upsert({
    where: { email: 'demo.reviewer@hickorydickorydecks.com' },
    update: {},
    create: {
      id: DEMO_USER_ID,
      email: 'demo.reviewer@hickorydickorydecks.com',
      name: 'Nathan Ricke',
      role: 'admin',
      franchiseId: franchise.id,
    },
  })

  console.log(`Created admin user: ${adminUser.email}`)

  // Create demo images using placeholder service
  const imageData = [
    {
      id: IMAGE_IDS[0],
      url: 'https://placehold.co/800x600/2d5016/ffffff?text=Trex+Transcend+Deck',
      filename: 'trex-transcend-west-chester.jpg',
      altText: 'Trex Transcend composite deck in Havana Gold, West Chester OH',
      projectType: 'deck',
    },
    {
      id: IMAGE_IDS[1],
      url: 'https://placehold.co/800x600/1a3a0a/ffffff?text=Multi-Level+Deck',
      filename: 'multi-level-mason.jpg',
      altText: 'Multi-level TimberTech AZEK deck with hot tub area, Mason OH',
      projectType: 'multi_level_deck',
    },
    {
      id: IMAGE_IDS[2],
      url: 'https://placehold.co/800x600/3d6b22/ffffff?text=Pool+Deck',
      filename: 'pool-deck-anderson.jpg',
      altText: 'Composite pool deck surrounding in-ground pool, Anderson Township',
      projectType: 'pool_deck',
    },
    {
      id: IMAGE_IDS[3],
      url: 'https://placehold.co/800x600/4a7c2e/ffffff?text=Cedar+Pergola',
      filename: 'cedar-pergola-blue-ash.jpg',
      altText: 'Western red cedar pergola addition, Blue Ash OH',
      projectType: 'pergola',
    },
    {
      id: IMAGE_IDS[4],
      url: 'https://placehold.co/800x600/5d8d3a/ffffff?text=Hot+Tub+Deck',
      filename: 'hot-tub-deck-montgomery.jpg',
      altText: 'Hot tub deck with privacy lattice, Montgomery OH',
      projectType: 'hot_tub_deck',
    },
    {
      id: IMAGE_IDS[5],
      url: 'https://placehold.co/800x600/6e9e4b/ffffff?text=Cable+Railing',
      filename: 'cable-railing-loveland.jpg',
      altText: 'Modern cable railing system installation, Loveland OH',
      projectType: 'railing',
    },
  ]

  for (const img of imageData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageCreateData: any = {
      id: img.id,
      franchiseId: franchise.id,
      url: img.url,
      filename: img.filename,
      altText: img.altText,
      projectType: img.projectType,
      tags: ['demo', img.projectType], // PostgreSQL supports arrays directly
      uploadedBy: adminUser.id,
    }
    await prisma.image.upsert({
      where: { id: img.id },
      update: {},
      create: imageCreateData,
    })
  }

  console.log(`Created ${imageData.length} demo images`)

  // Create demo posts across all statuses
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)

  const postData = [
    // 2 Draft posts
    {
      id: POST_IDS[0],
      postType: 'project_showcase',
      title: 'West Chester Deck Project',
      body: `Just completed this stunning 450 sq ft Trex Transcend composite deck in West Chester! The homeowners wanted a low-maintenance outdoor living space perfect for entertaining, and we delivered.

Features include a built-in bench, LED post cap lighting, and TimberTech black aluminum railings. The rich Havana Gold color complements their home beautifully.

With 25-year warranty protection and fade resistance, this deck will look amazing for decades. Ready to transform your backyard? Call us for a free estimate!`,
      status: 'draft',
      generatedBy: 'ai',
      generationPrompt: 'Generate a project showcase post for a composite deck in West Chester',
    },
    {
      id: POST_IDS[1],
      postType: 'educational',
      title: 'Composite vs Wood Decking',
      body: `Composite vs. Wood Decking: Making the Right Choice

Still deciding between composite and wood for your new deck? Here's what Cincinnati homeowners should know:

COMPOSITE ADVANTAGES:
• No staining, sealing, or painting ever
• Won't rot, warp, or splinter
• 25-year warranties standard
• Consistent color throughout

WOOD ADVANTAGES:
• Lower upfront cost
• Natural appearance
• Can be refinished

With Ohio's freeze-thaw cycles, we've seen wood decks require replacement in 10-15 years. Quality composites last 25-30+. Long-term, composite saves money AND weekends!`,
      status: 'draft',
      generatedBy: 'ai',
      generationPrompt: 'Generate an educational post about composite vs wood decking',
    },
    // 1 Pending review
    {
      id: POST_IDS[2],
      postType: 'seasonal',
      title: 'Spring Deck Planning',
      body: `SPRING IS HERE - Perfect Time to Plan Your New Deck!

Cincinnati's building season is upon us! Here's why spring is ideal for deck planning:

• Beat the summer rush (our schedule fills fast!)
• Enjoy your new deck all summer long
• Permit processing time is factored in
• Material availability is best now

We're currently booking projects for May-June installation. Early planners get first choice of dates!

FREE DESIGN CONSULTATIONS NOW AVAILABLE

Call 513-572-1200 or visit decks.ca/cincinnati`,
      status: 'pending_review',
      generatedBy: 'ai',
      generationPrompt: 'Generate a seasonal post for spring',
    },
    // 1 Approved
    {
      id: POST_IDS[3],
      postType: 'project_showcase',
      title: 'Mason Multi-Level Deck',
      body: `Check out this incredible multi-level deck we built in Mason! This project features:

• 600 sq ft main level with outdoor kitchen prep area
• Lower level hot tub deck with privacy lattice
• TimberTech AZEK decking in Coastline
• Custom cable railing system
• Integrated lighting throughout

The homeowners now have the perfect space for family gatherings year-round. Multi-level decks maximize your outdoor living potential!

Contact Hickory Dickory Decks Cincinnati for your free consultation: 513-572-1200`,
      status: 'approved',
      generatedBy: 'manual',
      approvedById: adminUser.id,
      approvedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    // 2 Scheduled (future dates)
    {
      id: POST_IDS[4],
      postType: 'educational',
      title: 'Hot Tub Deck Requirements',
      body: `HOT TUB DECK ESSENTIALS: What You Need to Know

Planning to add a hot tub to your backyard? Your deck needs special considerations:

WEIGHT CAPACITY: A filled hot tub + occupants can weigh 4,000+ lbs. Standard decks aren't designed for this - reinforced framing is essential.

ACCESS: Leave 3+ feet around the tub for service access and safe entry/exit.

ELECTRICAL: Most hot tubs need 220V dedicated circuits. Plan electrical runs during construction.

DRAINAGE: Proper slope prevents water pooling and extends your deck's life.

At Hickory Dickory Decks, we build hot tub decks right the first time!`,
      status: 'scheduled',
      scheduledFor: twoDaysFromNow,
      generatedBy: 'ai',
      approvedById: adminUser.id,
      approvedAt: now,
    },
    {
      id: POST_IDS[5],
      postType: 'project_showcase',
      title: 'Anderson Township Pool Deck',
      body: `Pool deck perfection in Anderson Township! This 800 sq ft Trex Transcend deck surrounds a beautiful in-ground pool with:

• Slip-resistant composite decking in Spiced Rum
• Hidden fastener system for bare-foot comfort
• Integrated bench seating
• Stone paver accent border

Composite decking is the ideal choice for pool areas - no splinters, no rot, no annual staining. Just summers of enjoyment!

Book your free estimate today: 513-572-1200`,
      status: 'scheduled',
      scheduledFor: fiveDaysFromNow,
      generatedBy: 'ai',
      approvedById: adminUser.id,
      approvedAt: now,
    },
    // 2 Published (past dates)
    {
      id: POST_IDS[6],
      postType: 'educational',
      title: 'Deck Maintenance Calendar',
      body: `DECK MAINTENANCE CALENDAR FOR CINCINNATI HOMEOWNERS

Spring: Inspect for winter damage, power wash, check fasteners and railings

Summer: Move planters periodically, keep grill away from railings, trim vegetation

Fall: Clear leaves promptly, check drainage gaps, inspect flashing and ledger board

Winter: Use plastic shovels only, avoid rock salt (calcium chloride is safer)

Questions about maintaining your deck? Give us a call at 513-572-1200!`,
      status: 'published',
      publishedAt: oneWeekAgo,
      googlePostId: 'demo-post-published-1',
      googlePostUrl: 'https://business.google.com/posts/demo/post-1',
      generatedBy: 'ai',
      approvedById: adminUser.id,
      approvedAt: new Date(oneWeekAgo.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      id: POST_IDS[7],
      postType: 'seasonal',
      title: 'Summer Outdoor Living',
      body: `SUMMER LIVING STARTS ON YOUR DECK

There's nothing like a Cincinnati summer evening on a beautiful deck. Are you making the most of yours?

If your deck needs repair or you're ready for an upgrade, NOW is the time to act:

• Quick turnaround times available
• Financing options to fit any budget
• 35+ years of deck building expertise
• Locally owned, nationally backed

From simple repairs to complete rebuilds, Hickory Dickory Decks Cincinnati handles it all.

Schedule your free estimate: 513-572-1200`,
      status: 'published',
      publishedAt: threeDaysAgo,
      googlePostId: 'demo-post-published-2',
      googlePostUrl: 'https://business.google.com/posts/demo/post-2',
      generatedBy: 'manual',
      approvedById: adminUser.id,
      approvedAt: new Date(threeDaysAgo.getTime() - 24 * 60 * 60 * 1000),
    },
  ]

  for (const post of postData) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        franchiseId: franchise.id,
        postType: post.postType,
        title: post.title,
        body: post.body,
        status: post.status,
        callToAction: 'LEARN_MORE',
        callToActionUrl: 'https://decks.ca/deck-builders/cincinnati',
        generatedBy: post.generatedBy,
        generationPrompt: post.generationPrompt || null,
        createdById: adminUser.id,
        approvedById: post.approvedById || null,
        approvedAt: post.approvedAt || null,
        scheduledFor: post.scheduledFor || null,
        publishedAt: post.publishedAt || null,
        googlePostId: post.googlePostId || null,
        googlePostUrl: post.googlePostUrl || null,
      },
    })

    // Attach an image to project showcase posts
    if (post.postType === 'project_showcase') {
      const imageIndex = postData.indexOf(post) % imageData.length
      await prisma.postImage.upsert({
        where: {
          postId_imageId: {
            postId: post.id,
            imageId: IMAGE_IDS[imageIndex],
          },
        },
        update: {},
        create: {
          postId: post.id,
          imageId: IMAGE_IDS[imageIndex],
          displayOrder: 0,
        },
      })
    }
  }

  console.log(`Created ${postData.length} demo posts`)

  // Create generation queue entries - Valid UUIDs
  const queueData = [
    {
      id: 'd3000000-3000-0000-0000-000000000001',
      postType: 'project_showcase',
      generateForDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
    },
    {
      id: 'd3000000-3000-0000-0000-000000000002',
      postType: 'educational',
      generateForDate: oneWeekAgo,
      status: 'completed',
      completedAt: oneWeekAgo,
    },
    {
      id: 'd3000000-3000-0000-0000-000000000003',
      postType: 'seasonal',
      generateForDate: threeDaysAgo,
      status: 'failed',
    },
  ]

  for (const queue of queueData) {
    await prisma.generationQueue.upsert({
      where: { id: queue.id },
      update: {},
      create: {
        id: queue.id,
        franchiseId: franchise.id,
        postType: queue.postType,
        generateForDate: queue.generateForDate,
        status: queue.status,
        completedAt: queue.completedAt || null,
      },
    })
  }

  console.log(`Created ${queueData.length} generation queue entries`)

  console.log('\nDemo seed completed successfully!')
  console.log('---')
  console.log('Demo login: demo.reviewer@hickorydickorydecks.com')
  console.log('(No password required in demo mode)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
