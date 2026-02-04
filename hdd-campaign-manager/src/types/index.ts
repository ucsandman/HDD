export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export type CampaignType = 'email' | 'sms' | 'social' | 'gbp';

export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'completed';

export interface CampaignTemplate {
  id: string;
  name: string;
  season: Season;
  type: CampaignType;
  subject?: string;
  content: string;
  tags: string[];
  isActive: boolean;
}

export interface Campaign {
  id: string;
  templateId: string;
  name: string;
  season: Season;
  scheduledDate: string;
  status: CampaignStatus;
  sentAt?: string;
  notes: string;
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

export const SEASON_COLORS: Record<Season, string> = {
  spring: 'bg-green-100 text-green-800',
  summer: 'bg-yellow-100 text-yellow-800',
  fall: 'bg-orange-100 text-orange-800',
  winter: 'bg-blue-100 text-blue-800',
};

export const SEASON_ICONS: Record<Season, string> = {
  spring: '🌸',
  summer: '☀️',
  fall: '🍂',
  winter: '❄️',
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  email: 'Email',
  sms: 'SMS',
  social: 'Social Media',
  gbp: 'Google Business',
};

export const CAMPAIGN_TYPE_COLORS: Record<CampaignType, string> = {
  email: 'bg-purple-100 text-purple-800',
  sms: 'bg-teal-100 text-teal-800',
  social: 'bg-pink-100 text-pink-800',
  gbp: 'bg-indigo-100 text-indigo-800',
};

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sent: 'Sent',
  completed: 'Completed',
};

export const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-slate-100 text-slate-800',
  scheduled: 'bg-blue-100 text-blue-800',
  sent: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
};

// Pre-built campaign templates
export const DEFAULT_TEMPLATES: CampaignTemplate[] = [
  // Spring Templates
  {
    id: 'spring-1',
    name: 'Spring Deck Season is Here!',
    season: 'spring',
    type: 'email',
    subject: 'Spring is Here - Time for Your Dream Deck!',
    content: `Hi {{name}},

Spring has arrived in Cincinnati, and it's the perfect time to start planning your outdoor living space!

At Hickory Dickory Decks, we're booking projects now for the spring and summer season. Whether you're dreaming of a new deck, pergola, or outdoor entertainment area, we'd love to help make it happen.

Why spring is the ideal time to build:
- Perfect weather for construction
- Enjoy your new deck all summer long
- Beat the rush - our schedule fills up fast!

Ready to get started? Reply to this email or call us at (513) 555-1234 for a free consultation.

Best regards,
Nathan Ricke
Hickory Dickory Decks Cincinnati`,
    tags: ['seasonal', 'booking', 'outreach'],
    isActive: true,
  },
  {
    id: 'spring-2',
    name: 'Book Early for Summer',
    season: 'spring',
    type: 'sms',
    content: `Hi {{name}}! Spring is here and our summer schedule is filling fast. Book your deck project now to enjoy it all season! Call us at (513) 555-1234 for a free estimate. - HDD Cincinnati`,
    tags: ['booking', 'urgency'],
    isActive: true,
  },
  {
    id: 'spring-3',
    name: 'Spring Cleaning Special',
    season: 'spring',
    type: 'gbp',
    content: `🌸 Spring Deck Season is HERE!

As Cincinnati shakes off winter, it's the perfect time to upgrade your outdoor living space. Our expert team is ready to build your dream deck!

✅ Free consultations
✅ Quality composite and wood options
✅ Professional installation
✅ Financing available

Book now and enjoy your new deck all summer long! Limited spring slots available.

📞 Call (513) 555-1234 or visit our website for a free estimate.

#CincinnatiDecks #SpringHome #OutdoorLiving #DeckBuilders`,
    tags: ['gbp', 'seasonal', 'booking'],
    isActive: true,
  },

  // Summer Templates
  {
    id: 'summer-1',
    name: 'Perfect Deck Weather',
    season: 'summer',
    type: 'email',
    subject: "It's Perfect Deck Weather in Cincinnati!",
    content: `Hi {{name}},

Can you feel that summer heat? There's nothing better than spending warm evenings on a beautiful deck with family and friends.

If you've been thinking about upgrading your outdoor space, now is the time! We still have openings in our summer schedule, but they're going fast.

Summer deck benefits:
- Extended outdoor living season
- Perfect for entertaining
- Adds value to your home
- Creates memories that last

Don't spend another summer wishing you had a better outdoor space. Let's make it happen!

Schedule your free consultation today: (513) 555-1234

Warm regards,
Nathan Ricke
Hickory Dickory Decks Cincinnati`,
    tags: ['seasonal', 'lifestyle'],
    isActive: true,
  },
  {
    id: 'summer-2',
    name: 'Summer Entertaining Ready',
    season: 'summer',
    type: 'social',
    content: `☀️ Summer entertaining season is in full swing!

Is your deck ready for backyard BBQs, family gatherings, and relaxing evenings under the stars?

At Hickory Dickory Decks Cincinnati, we build outdoor spaces that bring people together. From intimate decks to expansive entertainment areas, we've got you covered.

🔨 Quality craftsmanship
🎨 Custom designs
⏰ Fast, professional installation

Ready to transform your backyard? Link in bio for free estimates!

#SummerVibes #CincinnatiLife #DeckLife #OutdoorEntertaining #BackyardGoals`,
    tags: ['social', 'lifestyle', 'engagement'],
    isActive: true,
  },
  {
    id: 'summer-3',
    name: 'Beat the Heat with New Deck',
    season: 'summer',
    type: 'sms',
    content: `Hey {{name}}! Hot summer = perfect deck weather! Still time to book your project this season. Cool drinks, warm nights, great memories await. Free estimates: (513) 555-1234 - HDD Cincinnati`,
    tags: ['seasonal', 'urgency'],
    isActive: true,
  },

  // Fall Templates
  {
    id: 'fall-1',
    name: 'Fall Booking Discount',
    season: 'fall',
    type: 'email',
    subject: 'Fall Special: Book Now, Save Big!',
    content: `Hi {{name}},

Fall is a fantastic time to plan your deck project! The weather is cooling down, and we're offering special fall pricing to fill our schedule.

Why book your deck project now:
- Fall special pricing available
- Beat the spring rush
- Perfect weather for construction
- Your deck will be ready for spring entertaining

Plus, booking now means you'll be at the top of our spring completion list!

Limited fall openings available. Contact us today for a free estimate and fall pricing details.

Call: (513) 555-1234

Best,
Nathan Ricke
Hickory Dickory Decks Cincinnati`,
    tags: ['seasonal', 'discount', 'booking'],
    isActive: true,
  },
  {
    id: 'fall-2',
    name: 'Last Chance Before Winter',
    season: 'fall',
    type: 'gbp',
    content: `🍂 Last Chance Before Winter!

Don't wait until spring - book your deck project now and beat the rush!

Fall is the perfect time to plan:
✅ Lock in 2024 pricing
✅ Priority spring scheduling
✅ Free design consultation
✅ Weather-protected construction

Our Cincinnati team is ready to help you create the outdoor space you've been dreaming of.

📞 (513) 555-1234
Limited fall appointments available!

#FallPlanning #CincinnatiDecks #HomeImprovement #DeckDesign`,
    tags: ['gbp', 'urgency', 'seasonal'],
    isActive: true,
  },
  {
    id: 'fall-3',
    name: 'Thanksgiving Ready',
    season: 'fall',
    type: 'sms',
    content: `Hi {{name}}! Planning holiday gatherings? Book now for a spring deck install & be ready for next year's outdoor entertaining. Fall specials available! (513) 555-1234 - HDD`,
    tags: ['holiday', 'booking'],
    isActive: true,
  },

  // Winter Templates
  {
    id: 'winter-1',
    name: 'Plan Now for Spring',
    season: 'winter',
    type: 'email',
    subject: 'Plan Your Spring Deck Project Now',
    content: `Hi {{name}},

While it may be cold outside, now is the perfect time to plan your spring deck project!

By planning now, you can:
- Lock in current pricing before any increases
- Secure an early spring start date
- Take your time with design decisions
- Be enjoying your new deck by summer

Our design team is available all winter for consultations. We'll work with you to create the perfect outdoor space, so when spring arrives, we're ready to build!

Schedule your winter planning session: (513) 555-1234

Stay warm,
Nathan Ricke
Hickory Dickory Decks Cincinnati`,
    tags: ['planning', 'early-booking'],
    isActive: true,
  },
  {
    id: 'winter-2',
    name: 'Winter Planning Special',
    season: 'winter',
    type: 'social',
    content: `❄️ Cold outside? Perfect time to plan your dream deck!

While you're cozy inside, let's design your perfect outdoor space for spring.

Winter planning perks:
🎯 Lock in 2024 pricing
📅 First in line for spring construction
🎨 Extra time for perfect design
💰 Special winter booking incentives

Don't wait for spring - the best projects are planned in winter!

DM us or call (513) 555-1234 to start planning.

#WinterPlanning #SpringReady #CincinnatiDecks #DreamDeck #HomeGoals`,
    tags: ['social', 'planning', 'seasonal'],
    isActive: true,
  },
  {
    id: 'winter-3',
    name: 'New Year New Deck',
    season: 'winter',
    type: 'gbp',
    content: `🎆 New Year, New Deck!

Make 2024 the year you finally get that outdoor space you've been dreaming of!

Start the year right:
✅ Free winter design consultations
✅ Lock in current pricing
✅ Priority spring scheduling
✅ Custom designs for any budget

Our Cincinnati team is ready to help you plan the perfect deck, patio, or pergola.

New year special: Book your consultation in January and receive a FREE upgrade!

📞 (513) 555-1234

#NewYear2024 #DeckGoals #CincinnatiHome #OutdoorLiving`,
    tags: ['gbp', 'new-year', 'special'],
    isActive: true,
  },
];
