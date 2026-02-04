/**
 * HDD Marketing Tools Dashboard Configuration
 *
 * This dashboard is for LOCAL DEVELOPMENT use only.
 * The localhost URLs below point to development servers.
 * For production deployments, each tool has its own domain.
 */
const TOOLS = [
  {
    id: "sentiment-router",
    name: "Sentiment Router",
    description: "Routes customers by satisfaction level. Happy customers go directly to Google Reviews. Unhappy customers get a private feedback form that goes straight to the franchise owner.",
    stack: "HTML, CSS, JavaScript",
    status: "ready",
    launchUrl: "../hdd-sentiment-router/index.html",
    setup: {
      commands: [
        "# No install needed",
        "# Edit config.js with your franchise settings",
        "# Open index.html in browser"
      ],
      envVars: [],
      externalServices: []
    }
  },
  {
    id: "quote-calculator",
    name: "Quote Calculator",
    description: "Customer-facing deck estimate tool. Input dimensions, materials, and features to get a ballpark price range. Drives leads to request full consultations.",
    stack: "HTML, CSS, JavaScript",
    status: "ready",
    launchUrl: "../hdd-quote-calculator/index.html",
    setup: {
      commands: [
        "# No install needed",
        "# Edit config.js to adjust pricing for your market",
        "# Open index.html in browser"
      ],
      envVars: [],
      externalServices: []
    }
  },
  {
    id: "review-generator",
    name: "Review Request Generator",
    description: "Generates personalized review request messages from customer and project details. Creates SMS, email, and thank you card text ready to copy and send on a 3/7/14 day schedule.",
    stack: "React, TypeScript, Tailwind CSS, Vite",
    status: "ready",
    launchUrl: "http://localhost:5173",
    setup: {
      commands: [
        "cd hdd-review-generator",
        "npm run dev"
      ],
      envVars: [],
      externalServices: []
    }
  },
  {
    id: "photo-manager",
    name: "Project Photo Manager",
    description: "Organize before/after project photos. Tag by project type, material, and neighborhood. Quick export for GBP posts, social media, and website galleries.",
    stack: "React, TypeScript, Tailwind CSS, Vite",
    status: "ready",
    launchUrl: "http://localhost:5174",
    setup: {
      commands: [
        "cd hdd-photo-manager",
        "npm run dev"
      ],
      envVars: [],
      externalServices: []
    }
  },
  {
    id: "referral-tracker",
    name: "Referral Tracker",
    description: "Track lead sources and referral codes. See which marketing channels convert best. Give past customers referral links to share.",
    stack: "React, TypeScript, Tailwind CSS, Vite",
    status: "ready",
    launchUrl: "http://localhost:5175",
    setup: {
      commands: [
        "cd hdd-referral-tracker",
        "npm run dev"
      ],
      envVars: [],
      externalServices: []
    }
  },
  {
    id: "warranty-tracker",
    name: "Warranty Tracker",
    description: "Track customer warranties and schedule maintenance reminders. Send annual checkup notifications and seasonal care tips.",
    stack: "React, TypeScript, Tailwind CSS, Vite",
    status: "ready",
    launchUrl: "http://localhost:5176",
    setup: {
      commands: [
        "cd hdd-warranty-tracker",
        "npm run dev"
      ],
      envVars: [],
      externalServices: []
    }
  },
  {
    id: "gbp-poster",
    name: "GBP Post Scheduler",
    description: "AI-powered Google Business Profile post creation with a human review workflow. Generates draft posts using Claude, lets you review and edit, then publishes on schedule.",
    stack: "Next.js, Prisma, Claude AI, Google Business Profile API",
    status: "needs-setup",
    launchUrl: "http://localhost:3000",
    setup: {
      commands: [
        "cd hdd-gbp-poster",
        "cp .env.example .env",
        "# Fill in .env values (see env vars below)",
        "npx prisma db push",
        "npx prisma db seed",
        "npm run dev"
      ],
      envVars: [
        { name: "DATABASE_URL", purpose: "Neon PostgreSQL connection string" },
        { name: "NEXTAUTH_SECRET", purpose: "Session encryption key (generate with openssl rand -base64 32)" },
        { name: "NEXTAUTH_URL", purpose: "App URL (http://localhost:3000 for dev)" },
        { name: "RESEND_API_KEY", purpose: "Email delivery for magic link login" },
        { name: "EMAIL_FROM", purpose: "Sender address for login emails" },
        { name: "ANTHROPIC_API_KEY", purpose: "Claude API for post generation" },
        { name: "GOOGLE_CLIENT_ID", purpose: "Google OAuth for GBP access" },
        { name: "GOOGLE_CLIENT_SECRET", purpose: "Google OAuth secret" },
        { name: "BLOB_READ_WRITE_TOKEN", purpose: "Vercel Blob for image storage" },
        { name: "CRON_SECRET", purpose: "Authentication for scheduled jobs" },
        { name: "ENCRYPTION_KEY", purpose: "Encrypts stored OAuth tokens" }
      ],
      externalServices: [
        "Neon database (neon.tech)",
        "Resend account (resend.com)",
        "Anthropic API key (console.anthropic.com)",
        "Google Cloud project with Business Profile API enabled",
        "Vercel project with Blob storage enabled"
      ]
    }
  },
  {
    id: "lead-response",
    name: "Lead Response System",
    description: "Automated lead follow-up engine. When a lead comes in, sends an instant SMS and email, then follows up automatically over 7 days until the lead responds or books a consultation.",
    stack: "Next.js, Prisma, Twilio, Resend, Cal.com",
    status: "needs-setup",
    launchUrl: "http://localhost:3001",
    setup: {
      commands: [
        "cd hdd-lead-response",
        "cp .env.example .env",
        "# Fill in .env values (see env vars below)",
        "npx prisma db push",
        "npx prisma db seed",
        "npm run dev"
      ],
      envVars: [
        { name: "DATABASE_URL", purpose: "Neon PostgreSQL connection string" },
        { name: "NEXTAUTH_SECRET", purpose: "Session encryption key" },
        { name: "NEXTAUTH_URL", purpose: "App URL (http://localhost:3000 for dev)" },
        { name: "RESEND_API_KEY", purpose: "Email delivery" },
        { name: "EMAIL_FROM", purpose: "Sender address" },
        { name: "TWILIO_ACCOUNT_SID", purpose: "Twilio account identifier" },
        { name: "TWILIO_AUTH_TOKEN", purpose: "Twilio authentication" },
        { name: "TWILIO_PHONE_NUMBER", purpose: "SMS sending number (use 513 area code)" },
        { name: "CAL_BOOKING_LINK", purpose: "Cal.com booking page URL" },
        { name: "CAL_WEBHOOK_SECRET", purpose: "Webhook signature verification" },
        { name: "CRON_SECRET", purpose: "Authentication for scheduled jobs" },
        { name: "WEBHOOK_SECRET", purpose: "Lead intake webhook auth" }
      ],
      externalServices: [
        "Neon database (neon.tech)",
        "Resend account (resend.com)",
        "Twilio account with a purchased phone number",
        "Cal.com booking page with webhook configured"
      ]
    }
  },
  {
    id: "weather-content",
    name: "Weather Content Suggester",
    description: "Auto-suggests GBP posts based on Cincinnati weather. 'Perfect deck weather this weekend!' when sunny, seasonal planning tips in winter.",
    stack: "React, TypeScript, NWS Weather API",
    status: "ready",
    launchUrl: "http://localhost:5177",
    setup: {
      commands: [
        "cd hdd-weather-content",
        "npm run dev"
      ],
      envVars: [],
      externalServices: [
        "Uses free NWS Weather API (no key required)"
      ]
    }
  },
  {
    id: "competitor-monitor",
    name: "Competitor Monitor",
    description: "Track local deck builders' Google ratings, review counts, and GBP activity. See how you compare and spot opportunities.",
    stack: "React, TypeScript, Tailwind CSS",
    status: "ready",
    launchUrl: "http://localhost:5178",
    setup: {
      commands: [
        "cd hdd-competitor-monitor",
        "npm run dev"
      ],
      envVars: [],
      externalServices: []
    }
  }
];

const DASHBOARD = {
  title: "HDD Marketing Tools",
  subtitle: "Hickory Dickory Decks — Franchise Marketing Suite",
  franchisee: "Cincinnati (Nathan & Brinton Ricke)",
};
