/**
 * Demo post content for when ANTHROPIC_API_KEY is not configured
 *
 * These posts reference real Cincinnati neighborhoods, real materials,
 * and realistic project types to feel like actual GBP posts.
 */

export interface DemoPostContent {
  body: string
  postType: string
  generationPrompt: string
}

const PROJECT_SHOWCASE_POSTS: DemoPostContent[] = [
  {
    body: `Just completed this stunning 450 sq ft Trex Transcend composite deck in West Chester! The homeowners wanted a low-maintenance outdoor living space perfect for entertaining, and we delivered. Features include a built-in bench, LED post cap lighting, and TimberTech black aluminum railings.

The rich Havana Gold color complements their home beautifully. With 25-year warranty protection and fade resistance, this deck will look amazing for decades.

Ready to transform your backyard? Call us for a free estimate!`,
    postType: 'project_showcase',
    generationPrompt: 'Generate a project showcase post for a composite deck in West Chester',
  },
  {
    body: `Check out this incredible multi-level deck we built in Mason! This project features:

- 600 sq ft main level with outdoor kitchen prep area
- Lower level hot tub deck with privacy lattice
- TimberTech AZEK decking in Coastline
- Custom cable railing system
- Integrated lighting throughout

The homeowners now have the perfect space for family gatherings year-round. Multi-level decks maximize your outdoor living potential!

Contact Hickory Dickory Decks Cincinnati for your free consultation.`,
    postType: 'project_showcase',
    generationPrompt: 'Generate a project showcase post for a multi-level deck in Mason',
  },
  {
    body: `Pool deck perfection in Anderson Township! This 800 sq ft Trex Transcend deck surrounds a beautiful in-ground pool with:

- Slip-resistant composite decking in Spiced Rum
- Hidden fastener system for bare-foot comfort
- Integrated bench seating
- Stone paver accent border

Composite decking is the ideal choice for pool areas - no splinters, no rot, no annual staining. Just summers of enjoyment!

Book your free estimate today: 513-572-1200`,
    postType: 'project_showcase',
    generationPrompt: 'Generate a project showcase post for a pool deck in Anderson Township',
  },
  {
    body: `Beautiful pergola addition in Blue Ash! We added this 12x14 cedar pergola to an existing composite deck, creating the perfect shaded retreat.

Features:
- Western red cedar construction
- Adjustable shade canopy
- Integrated LED string light posts
- Built-in planter boxes

Pergolas add architectural interest and extend your outdoor living season. This homeowner now enjoys morning coffee and evening dinners outside!

Transform your deck with a custom pergola - call for details!`,
    postType: 'project_showcase',
    generationPrompt: 'Generate a project showcase post for a pergola addition in Blue Ash',
  },
]

const EDUCATIONAL_POSTS: DemoPostContent[] = [
  {
    body: `Composite vs. Wood Decking: Making the Right Choice

Still deciding between composite and wood for your new deck? Here's what Cincinnati homeowners should know:

COMPOSITE ADVANTAGES:
- No staining, sealing, or painting ever
- Won't rot, warp, or splinter
- 25-year warranties standard
- Consistent color throughout

WOOD ADVANTAGES:
- Lower upfront cost
- Natural appearance
- Can be refinished

With Ohio's freeze-thaw cycles, we've seen wood decks require replacement in 10-15 years. Quality composites last 25-30+.

Long-term, composite saves money AND weekends. Questions? We're here to help!`,
    postType: 'educational',
    generationPrompt: 'Generate an educational post about composite vs wood decking',
  },
  {
    body: `HOT TUB DECK ESSENTIALS: What You Need to Know

Planning to add a hot tub to your backyard? Your deck needs special considerations:

WEIGHT CAPACITY: A filled hot tub + occupants can weigh 4,000+ lbs. Standard decks aren't designed for this - reinforced framing is essential.

ACCESS: Leave 3+ feet around the tub for service access and safe entry/exit.

ELECTRICAL: Most hot tubs need 220V dedicated circuits. Plan electrical runs during construction.

DRAINAGE: Proper slope prevents water pooling and extends your deck's life.

PRIVACY: Consider lattice screens or pergolas for a relaxing retreat.

At Hickory Dickory Decks, we build hot tub decks right the first time. Free consultations available!`,
    postType: 'educational',
    generationPrompt: 'Generate an educational post about hot tub deck requirements',
  },
  {
    body: `DECK MAINTENANCE CALENDAR FOR CINCINNATI HOMEOWNERS

Spring:
- Inspect for winter damage
- Power wash (low pressure on composite)
- Check all fasteners and railings
- Treat any mold or mildew spots

Summer:
- Move planters periodically to prevent discoloration
- Keep grill away from railings
- Trim nearby vegetation

Fall:
- Clear leaves promptly (they trap moisture)
- Check drainage gaps between boards
- Inspect flashing and ledger board

Winter:
- Use plastic shovels only
- Avoid rock salt (calcium chloride is safer)
- Remove snow before it compacts to ice

Questions about maintaining your deck? Give us a call!`,
    postType: 'educational',
    generationPrompt: 'Generate an educational post about deck maintenance',
  },
  {
    body: `RAILING OPTIONS: Finding Your Perfect Style

Your deck railing isn't just safety - it's a design statement! Here are popular options we install:

ALUMINUM BALUSTERS: Clean lines, zero maintenance, available in black, white, or bronze. Our most popular choice!

CABLE RAILING: Modern aesthetic with unobstructed views. Perfect for scenic properties.

GLASS PANELS: Maximum visibility, wind protection, contemporary look.

COMPOSITE/PVC: Match your decking color, excellent durability.

WOOD: Traditional warmth, can be painted or stained.

The right railing completes your deck's look. During your free consultation, we'll help you explore options that fit your style and budget.

Call Hickory Dickory Decks: 513-572-1200`,
    postType: 'educational',
    generationPrompt: 'Generate an educational post about railing options',
  },
]

const SEASONAL_POSTS: DemoPostContent[] = [
  {
    body: `SPRING IS HERE - Perfect Time to Plan Your New Deck!

Cincinnati's building season is upon us! Here's why spring is ideal for deck planning:

- Beat the summer rush (our schedule fills fast!)
- Enjoy your new deck all summer long
- Permit processing time is factored in
- Material availability is best now

We're currently booking projects for May-June installation. Early planners get first choice of dates!

FREE DESIGN CONSULTATIONS NOW AVAILABLE

We'll visit your home, discuss your vision, and provide a detailed quote - no obligation.

Ready to start? Call 513-572-1200 or visit decks.ca/cincinnati`,
    postType: 'seasonal',
    generationPrompt: 'Generate a seasonal post for spring',
  },
  {
    body: `SUMMER LIVING STARTS ON YOUR DECK

There's nothing like a Cincinnati summer evening on a beautiful deck. Are you making the most of yours?

If your deck needs repair or you're ready for an upgrade, NOW is the time to act:

- Quick turnaround times available
- Financing options to fit any budget
- 35+ years of deck building expertise
- Locally owned, nationally backed

From simple repairs to complete rebuilds, Hickory Dickory Decks Cincinnati handles it all.

Current project openings for late summer! Don't wait until it's too late.

Schedule your free estimate: 513-572-1200`,
    postType: 'seasonal',
    generationPrompt: 'Generate a seasonal post for summer',
  },
  {
    body: `FALL DECK INSPECTION TIME

Before winter arrives, now's the perfect time to assess your deck's condition:

CHECK FOR:
- Loose or popped fasteners
- Soft spots indicating rot
- Wobbly railings or posts
- Cracked or splintered boards
- Ledger board separation

FOUND ISSUES? Don't wait until spring!

Fall repairs prevent winter water damage from making problems worse. Our team can handle repairs now while weather permits.

PLANNING FOR NEXT YEAR?

Fall consultations lock in current pricing and secure your spot for spring installation.

Free inspections available: 513-572-1200`,
    postType: 'seasonal',
    generationPrompt: 'Generate a seasonal post for fall',
  },
  {
    body: `WINTER PROJECT PLANNING

While the snow falls, it's the perfect time to plan your dream deck!

WHY PLAN NOW:

- No pressure, no rush
- Research materials and styles
- Get accurate quotes before spring price increases
- Secure early-bird scheduling

DESIGN FROM THE COMFORT OF HOME

We offer virtual consultations! Share photos of your space, discuss your vision, and receive a detailed proposal - all without leaving your couch.

When spring arrives, you'll be ready to build while neighbors are just starting to think about it.

Start your project: decks.ca/cincinnati or call 513-572-1200

Wishing all our Cincinnati neighbors a safe and warm winter!`,
    postType: 'seasonal',
    generationPrompt: 'Generate a seasonal post for winter',
  },
]

/**
 * Get a random demo post based on post type
 */
export function getDemoPost(postType: string): DemoPostContent {
  let posts: DemoPostContent[]

  switch (postType) {
    case 'project_showcase':
      posts = PROJECT_SHOWCASE_POSTS
      break
    case 'educational':
      posts = EDUCATIONAL_POSTS
      break
    case 'seasonal':
      posts = SEASONAL_POSTS
      break
    default:
      posts = [...PROJECT_SHOWCASE_POSTS, ...EDUCATIONAL_POSTS, ...SEASONAL_POSTS]
  }

  return posts[Math.floor(Math.random() * posts.length)]
}

/**
 * Get all demo posts for seeding
 */
export function getAllDemoPosts(): DemoPostContent[] {
  return [...PROJECT_SHOWCASE_POSTS, ...EDUCATIONAL_POSTS, ...SEASONAL_POSTS]
}
