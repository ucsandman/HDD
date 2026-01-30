# Build Specification: HDD Google Business Profile Post Scheduler

## Project Overview

A web application that helps Hickory Dickory Decks franchisees create, review, and automatically publish posts to their Google Business Profile. The system uses Claude AI to draft posts, provides a human review workflow, and handles scheduled publishing via the Google Business Profile API.

This build is for the Cincinnati franchise (Nathan and Brinton Ricke) but should be structured to support additional franchises later.

---

## Core User Stories

1. **As a franchisee**, I want AI to generate draft posts so I don't have to write them from scratch
2. **As a franchisee**, I want to review and edit posts before they go live so I maintain quality control
3. **As a franchisee**, I want to attach photos to posts to showcase my work
4. **As a franchisee**, I want posts to publish automatically on a schedule so I don't have to remember to do it
5. **As a franchisee**, I want to adjust how often posts go out based on my preferences

---

## Technical Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js 14 (App Router) | React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes | Serverless functions on Vercel |
| Database | Neon (PostgreSQL) | Serverless Postgres |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 for drafting posts |
| Publishing | Google Business Profile API | OAuth 2.0 for authorization |
| Scheduling | Vercel Cron Jobs | Triggers publishing check |
| File Storage | Vercel Blob | For uploaded images |
| Authentication | NextAuth.js | Email magic links |
| Hosting | Vercel | Frontend, API, and cron jobs |

---

## Data Model

### Tables

```sql
-- Franchises (supports multiple locations later)
CREATE TABLE franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  google_account_id VARCHAR(255),
  google_location_id VARCHAR(255),
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMP,
  posts_per_week INTEGER DEFAULT 3,
  preferred_post_days VARCHAR(50) DEFAULT 'mon,wed,fri',
  preferred_post_time TIME DEFAULT '09:00',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  context_info TEXT, -- Background info for AI (services, history, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (franchise staff)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  franchise_id UUID REFERENCES franchises(id),
  role VARCHAR(50) DEFAULT 'editor', -- 'admin' or 'editor'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Images (uploaded by franchisees)
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID REFERENCES franchises(id),
  url VARCHAR(500) NOT NULL,
  filename VARCHAR(255),
  alt_text VARCHAR(255),
  project_type VARCHAR(100), -- 'deck', 'pergola', 'railing', etc.
  tags VARCHAR(255)[], -- ['before-after', 'trex', 'multi-level']
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID REFERENCES franchises(id),
  
  -- Content
  post_type VARCHAR(50) NOT NULL, -- 'project_showcase', 'educational', 'seasonal'
  title VARCHAR(255),
  body TEXT NOT NULL,
  call_to_action VARCHAR(50), -- 'LEARN_MORE', 'CALL', 'BOOK', etc.
  call_to_action_url VARCHAR(500),
  
  -- Status workflow
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending_review', 'approved', 'scheduled', 'published', 'failed'
  
  -- Scheduling
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,
  
  -- Google API response
  google_post_id VARCHAR(255),
  google_post_url VARCHAR(500),
  publish_error TEXT,
  
  -- Metadata
  generated_by VARCHAR(50), -- 'ai', 'manual'
  generation_prompt TEXT, -- Store the prompt used for AI generation
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Post Images (many-to-many)
CREATE TABLE post_images (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id),
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (post_id, image_id)
);

-- Generation Queue (for scheduled AI draft generation)
CREATE TABLE generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID REFERENCES franchises(id),
  post_type VARCHAR(50) NOT NULL,
  generate_for_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## Authentication Flow

Using NextAuth.js with email magic links (no passwords):

1. User enters email on login page
2. System checks if email exists in `users` table
3. If yes, sends magic link via email
4. User clicks link, gets session cookie
5. Session includes user ID and franchise ID

**Important**: Only pre-registered users can log in. There is no public signup. Admins add users manually (or via a simple admin function initially).

---

## Google Business Profile Integration

### Setup Requirements

1. Google Cloud Project with Business Profile API enabled
2. OAuth 2.0 credentials (Web application type)
3. Authorized redirect URI: `https://{app-domain}/api/auth/google/callback`

### OAuth Flow

1. Admin clicks "Connect Google Business Profile" in settings
2. Redirect to Google OAuth consent screen
3. User grants permission to manage their business profile
4. Google redirects back with auth code
5. Exchange code for access/refresh tokens
6. Store tokens in `franchises` table
7. Fetch and store account ID and location ID

### Token Refresh

Before any GBP API call:
1. Check if `google_token_expires_at` is within 5 minutes
2. If so, use refresh token to get new access token
3. Update stored tokens

### Publishing a Post

```javascript
// POST https://mybusiness.googleapis.com/v4/{parent}/localPosts
// parent = accounts/{accountId}/locations/{locationId}

{
  "languageCode": "en-US",
  "summary": "Post body text here (max 1500 chars)",
  "callToAction": {
    "actionType": "LEARN_MORE",
    "url": "https://decks.ca/deck-builders/cincinnati"
  },
  "media": [
    {
      "mediaFormat": "PHOTO",
      "sourceUrl": "https://publicly-accessible-url.com/image.jpg"
    }
  ]
}
```

**Note**: Images must be publicly accessible URLs. Vercel Blob provides this.

---

## AI Post Generation

### System Prompt

```
You are a social media content writer for Hickory Dickory Decks, a composite deck building company in Cincinnati, Ohio. You write Google Business Profile posts that are:

- Friendly and professional, never salesy or pushy
- Focused on helping homeowners, not hard selling
- Locally relevant to Cincinnati and surrounding areas (West Chester, Mason, Loveland, Anderson Township, Blue Ash)
- Knowledgeable about composite/PVC decking benefits (low maintenance, durability, no staining)

Business context:
- Owners: Nathan and Brinton Ricke (brothers)
- Specialties: Composite and PVC decking, hot tub decks, pool decks, pergolas, railings
- Backed by 35+ years of Hickory Dickory Decks franchise experience
- Service area: Greater Cincinnati, Hamilton, Butler, Warren, and Clermont counties

Write posts that feel like they come from a local business owner who genuinely cares about helping people create great outdoor spaces. Keep posts under 1500 characters (Google's limit). Do not use hashtags. End with a soft call to action when appropriate.
```

### Generation Prompts by Post Type

**Project Showcase**:
```
Write a Google Business Profile post showcasing a recently completed {project_type} project.

Details:
- Project type: {project_type}
- Neighborhood/area: {neighborhood} (if provided, otherwise just say "Cincinnati area")
- Materials: {materials} (if provided)
- Special features: {features} (if provided)

The tone should be proud but humble. Focus on how the homeowner can now enjoy their outdoor space. Do not mention specific prices or timelines.
```

**Educational**:
```
Write an educational Google Business Profile post about: {topic}

This should provide genuine value to homeowners considering a deck. Be helpful and informative, not promotional. You can mention Hickory Dickory Decks naturally but the focus is on educating the reader.

Keep it conversational and avoid being preachy or listicle-style.
```

**Seasonal**:
```
Write a seasonal Google Business Profile post appropriate for {season/month}.

Connect the season to outdoor living and deck enjoyment. For spring/summer, focus on enjoying outdoor spaces. For fall, mention it's a great time to plan/build (better contractor availability, enjoy it next spring). For winter, focus on planning ahead.

Keep it light and genuine. Don't be pushy about booking.
```

### Educational Topics Library

Store these in a config or database table for the UI to offer as options:

```
- Composite vs. wood decking: What Cincinnati homeowners should know
- How long does a composite deck last?
- Best decking materials for Ohio weather
- What to expect during the deck building process
- How to plan your deck layout
- Deck features that add the most value to your home
- Pool deck considerations: Materials that stay cool
- Hot tub deck requirements and ideas
- Multi-level deck designs for sloped yards
- Deck lighting options and benefits
- Railing choices: Cable, glass, composite, and aluminum
- Pergola vs. gazebo: Which is right for your backyard?
- When is the best time of year to build a deck?
- How to prepare your yard for deck construction
- Understanding deck permits in Ohio
- Deck maintenance: Composite vs. wood comparison
- Adding privacy to your deck: Screen and fence options
- Choosing deck colors that complement your home
- What questions to ask a deck contractor
- Signs your old deck needs replacement
```

---

## User Interface

### Pages

#### 1. Login (`/login`)
- Email input field
- "Send magic link" button
- Simple, clean design

#### 2. Dashboard (`/`)
- Overview cards:
  - Posts this week (scheduled/published)
  - Drafts awaiting review
  - Next scheduled post date/time
- Quick actions:
  - "Generate New Post" button
  - "View All Posts" link
- Recent activity list

#### 3. Posts List (`/posts`)
- Filterable by status: All, Drafts, Scheduled, Published
- Table/card view with:
  - Post preview (truncated body)
  - Status badge
  - Scheduled/published date
  - Actions (Edit, Delete, Approve)
- "Generate New Post" button

#### 4. Post Editor (`/posts/[id]` or `/posts/new`)
- Post type selector (Project Showcase / Educational / Seasonal)
- For AI generation:
  - Type-specific input fields (neighborhood, materials, topic, etc.)
  - "Generate Draft" button
  - Loading state while AI generates
- Rich text body editor (simple, no complex formatting)
- Image selector:
  - Grid of uploaded images (filterable by project type)
  - Click to attach (max 10 images per post)
  - Drag to reorder
  - "Upload New Image" button
- Call to action selector:
  - Type dropdown (Learn More, Call, Book, none)
  - URL field (pre-filled with franchise website)
- Character count (warn at 1400, error at 1500)
- Preview pane showing how it will look
- Actions:
  - Save Draft
  - Submit for Review (if editor role)
  - Approve & Schedule (if admin role, shows date/time picker)
  - Publish Now (if admin role)

#### 5. Image Library (`/images`)
- Grid of all uploaded images
- Filter by project type
- Upload dropzone (drag and drop or click)
- On upload: Set project type, optional tags, alt text
- Click image to see full size and edit metadata
- Delete option (warn if attached to posts)

#### 6. Settings (`/settings`)
- Franchise profile:
  - Name, contact info
  - Context info for AI (editable text area)
- Posting schedule:
  - Posts per week (1-7 slider or dropdown)
  - Preferred days (checkbox for each day)
  - Preferred time (time picker)
  - Timezone selector
- Google Business Profile:
  - Connection status
  - "Connect" or "Reconnect" button
  - "Disconnect" button
- User management (admin only):
  - List of users
  - Invite new user (email input)
  - Remove user

#### 7. Calendar View (`/calendar`) - Optional but nice
- Monthly calendar showing:
  - Scheduled posts (clickable to edit)
  - Published posts (different color)
  - Empty slots based on posting schedule
- Drag posts to reschedule

---

## Scheduling Logic

### Cron Job: Generate Weekly Drafts

**Schedule**: Every Sunday at midnight (franchise timezone)

**Logic**:
```
1. For each franchise:
   a. Get posting schedule (days + posts per week)
   b. Check how many drafts already exist for the coming week
   c. For each missing day:
      - Determine post type based on day (Mon=showcase, Wed=educational, Fri=seasonal) or rotate
      - Add entry to generation_queue
   d. Process generation_queue:
      - Call Claude API with appropriate prompt
      - Create post record with status='draft'
      - Mark queue entry as completed
```

### Cron Job: Publish Scheduled Posts

**Schedule**: Every 15 minutes

**Logic**:
```
1. Query posts where:
   - status = 'scheduled'
   - scheduled_for <= NOW()
   - franchise has valid Google tokens
2. For each post:
   a. Refresh Google token if needed
   b. Upload images to Google (if not already URLs)
   c. Call GBP API to create post
   d. If success:
      - Update status = 'published'
      - Store google_post_id and google_post_url
      - Set published_at = NOW()
   e. If failure:
      - Update status = 'failed'
      - Store error message in publish_error
      - (Don't retry automatically - let human investigate)
```

### Manual Scheduling

When user clicks "Approve & Schedule":
1. Show date/time picker
2. Default to next available slot based on franchise schedule
3. Allow override to any future date/time
4. Set status = 'scheduled', scheduled_for = selected time

When user clicks "Publish Now":
1. Immediately call GBP API
2. Show loading state
3. On success, show confirmation with link to post
4. On failure, show error and keep as draft

---

## API Routes

### Authentication
- `POST /api/auth/login` - Send magic link
- `GET /api/auth/verify` - Verify magic link token
- `POST /api/auth/logout` - Clear session

### Google OAuth
- `GET /api/auth/google` - Initiate OAuth flow
- `GET /api/auth/google/callback` - Handle OAuth callback

### Posts
- `GET /api/posts` - List posts (filterable by status)
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/posts/[id]/approve` - Approve and optionally schedule
- `POST /api/posts/[id]/publish` - Publish immediately

### AI Generation
- `POST /api/generate` - Generate post draft with Claude

### Images
- `GET /api/images` - List images (filterable)
- `POST /api/images` - Upload new image
- `PUT /api/images/[id]` - Update image metadata
- `DELETE /api/images/[id]` - Delete image

### Franchise/Settings
- `GET /api/franchise` - Get current franchise settings
- `PUT /api/franchise` - Update franchise settings

### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Invite user (admin only)
- `DELETE /api/users/[id]` - Remove user (admin only)

### Cron (called by Vercel Cron)
- `POST /api/cron/generate-drafts` - Weekly draft generation
- `POST /api/cron/publish-scheduled` - Check and publish scheduled posts

---

## Environment Variables

```
# Database
DATABASE_URL=postgresql://...@...neon.tech/...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-app.vercel.app

# Email (for magic links) - Using Resend
RESEND_API_KEY=...
EMAIL_FROM=noreply@your-domain.com

# Anthropic
ANTHROPIC_API_KEY=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Vercel Blob
BLOB_READ_WRITE_TOKEN=...

# Cron secret (to secure cron endpoints)
CRON_SECRET=...
```

---

## Initial Data Setup

For Cincinnati franchise:

```sql
INSERT INTO franchises (name, slug, context_info, timezone) VALUES (
  'Hickory Dickory Decks - Cincinnati',
  'cincinnati',
  'Owners: Nathan and Brinton Ricke (brothers). Located in Cincinnati, Ohio. Service area includes Greater Cincinnati, West Chester, Mason, Loveland, Anderson Township, Blue Ash, and communities across Hamilton, Butler, Warren, and Clermont counties. Specialties: Composite and PVC decking, hot tub decks, pool decks, pergolas, railings, sunrooms. Part of the Hickory Dickory Decks franchise with 35+ years of experience. Phone: 513-572-1200. Email: nricke@decks.ca. Website: https://decks.ca/deck-builders/cincinnati',
  'America/New_York'
);

-- Add initial admin user (Nathan)
INSERT INTO users (email, name, franchise_id, role) VALUES (
  'nricke@decks.ca',
  'Nathan Ricke',
  (SELECT id FROM franchises WHERE slug = 'cincinnati'),
  'admin'
);
```

---

## Security Considerations

1. **API Route Protection**: All API routes except auth routes require valid session
2. **Franchise Isolation**: Users can only access data for their own franchise
3. **Cron Security**: Cron endpoints check for `CRON_SECRET` header
4. **Token Storage**: Google tokens stored encrypted in database (use Vercel's encryption or similar)
5. **Image Uploads**: Validate file type and size before storing
6. **Rate Limiting**: Add rate limiting to AI generation endpoint to prevent abuse

---

## Error Handling

### Google API Errors
- Token expired: Attempt refresh, if fails mark as disconnected and notify user
- Rate limited: Back off and retry (store retry count)
- Invalid request: Log full error, show user-friendly message
- Location not found: Prompt user to reconnect Google account

### AI Generation Errors
- API error: Show "Generation failed, please try again" with retry button
- Content too long: Auto-truncate or ask AI to shorten
- Inappropriate content (if Claude refuses): Log and show generic error

### Publishing Errors
- Store full error in `publish_error` field
- Show on post detail page with "Retry" option
- Don't auto-retry to prevent duplicate posts

---

## File Structure

```
hdd-gbp-poster/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard
│   │   ├── posts/
│   │   │   ├── page.tsx             # Posts list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # New post
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Edit post
│   │   ├── images/
│   │   │   └── page.tsx             # Image library
│   │   ├── calendar/
│   │   │   └── page.tsx             # Calendar view
│   │   └── settings/
│   │       └── page.tsx             # Settings
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   └── google/
│   │   │       ├── route.ts         # Initiate OAuth
│   │   │       └── callback/
│   │   │           └── route.ts     # OAuth callback
│   │   ├── posts/
│   │   │   ├── route.ts             # List/Create
│   │   │   └── [id]/
│   │   │       ├── route.ts         # Get/Update/Delete
│   │   │       ├── approve/
│   │   │       │   └── route.ts
│   │   │       └── publish/
│   │   │           └── route.ts
│   │   ├── generate/
│   │   │   └── route.ts             # AI generation
│   │   ├── images/
│   │   │   ├── route.ts             # List/Upload
│   │   │   └── [id]/
│   │   │       └── route.ts         # Update/Delete
│   │   ├── franchise/
│   │   │   └── route.ts             # Get/Update settings
│   │   ├── users/
│   │   │   ├── route.ts             # List/Invite
│   │   │   └── [id]/
│   │   │       └── route.ts         # Delete
│   │   └── cron/
│   │       ├── generate-drafts/
│   │       │   └── route.ts
│   │       └── publish-scheduled/
│   │           └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # Reusable UI components
│   ├── post-editor.tsx
│   ├── image-picker.tsx
│   ├── post-preview.tsx
│   └── ...
├── lib/
│   ├── db.ts                        # Database client
│   ├── auth.ts                      # Auth utilities
│   ├── google.ts                    # Google API client
│   ├── anthropic.ts                 # Claude API client
│   ├── prompts.ts                   # AI prompt templates
│   └── utils.ts
├── prisma/
│   └── schema.prisma                # Or use raw SQL with Neon
├── public/
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json                      # Cron job config
```

---

## Vercel Cron Configuration

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-drafts",
      "schedule": "0 5 * * 0"
    },
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Note: Times are UTC. Adjust `generate-drafts` schedule for desired franchise timezone.

---

## Testing Checklist

### Authentication
- [ ] Magic link sends to valid email
- [ ] Magic link fails for unknown email
- [ ] Session persists across page refreshes
- [ ] Logout clears session

### Google Integration
- [ ] OAuth flow completes successfully
- [ ] Tokens are stored and refreshed properly
- [ ] Disconnect removes tokens
- [ ] API calls fail gracefully when disconnected

### Post Management
- [ ] Create draft post manually
- [ ] Generate draft with AI
- [ ] Edit existing post
- [ ] Attach images to post
- [ ] Character count updates in real time
- [ ] Approve post and schedule
- [ ] Publish post immediately
- [ ] Delete post

### Scheduling
- [ ] Scheduled post publishes at correct time
- [ ] Failed publish shows error and allows retry
- [ ] Weekly draft generation creates correct number of posts

### Image Management
- [ ] Upload image via drag and drop
- [ ] Upload image via file picker
- [ ] Filter images by project type
- [ ] Delete image (with warning if attached to posts)

---

## Future Enhancements (Out of Scope for V1)

- Multiple franchise support with franchise switcher
- Analytics dashboard showing post performance
- Bulk image upload
- AI image captioning
- Post templates library
- Duplicate post feature
- Team activity log
- Email notifications for scheduled posts
- Mobile responsive design improvements
- Integration with other social platforms (Facebook, Instagram)
