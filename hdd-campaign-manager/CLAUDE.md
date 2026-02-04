# HDD Seasonal Campaign Manager

## Overview

React application for managing pre-built marketing campaigns across spring, summer, fall, and winter seasons. Includes template library, campaign scheduling, and calendar view.

## Architecture

- **Frontend only**: No backend, all logic runs client-side
- **State**: React hooks (useState) for UI state, custom useCampaigns hook for data management
- **Persistence**: localStorage for campaigns and custom templates
- **Styling**: Tailwind CSS v4 via @tailwindcss/postcss

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, enums, and 12 pre-built templates |
| `src/utils/storage.ts` | localStorage persistence, CSV export |
| `src/hooks/useCampaigns.ts` | Campaign CRUD, template management, filtering |
| `src/components/Header.tsx` | App header with navigation tabs |
| `src/components/StatsBar.tsx` | Campaign statistics display |
| `src/components/TemplateLibrary.tsx` | Browse templates by season/type |
| `src/components/TemplatePreview.tsx` | Full template preview modal |
| `src/components/CampaignForm.tsx` | Create campaign from template |
| `src/components/CampaignList.tsx` | Campaign table with filters |
| `src/components/CampaignDetail.tsx` | View/edit campaign modal |
| `src/components/CalendarView.tsx` | Monthly calendar view |

## Commands

```bash
npm run dev     # Development server at localhost:5187
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Data Model

### Season
```typescript
type Season = 'spring' | 'summer' | 'fall' | 'winter';
```

### CampaignType
```typescript
type CampaignType = 'email' | 'sms' | 'social' | 'gbp';
```

### CampaignTemplate
```typescript
{
  id: string;
  name: string;
  season: Season;
  type: CampaignType;
  subject?: string;        // For email templates
  content: string;
  tags: string[];
  isActive: boolean;
}
```

### Campaign
```typescript
{
  id: string;
  templateId: string;
  name: string;
  season: Season;
  scheduledDate: string;   // ISO date (YYYY-MM-DD)
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
  sentAt?: string;         // ISO datetime when sent
  notes: string;
}
```

## Pre-Built Templates (12 total)

### Spring
1. **Spring Deck Season is Here!** (Email) - Main spring outreach
2. **Book Early for Summer** (SMS) - Urgency booking message
3. **Spring Cleaning Special** (GBP) - Google Business seasonal post

### Summer
1. **Perfect Deck Weather** (Email) - Summer lifestyle message
2. **Summer Entertaining Ready** (Social) - Social media engagement
3. **Beat the Heat with New Deck** (SMS) - Summer SMS push

### Fall
1. **Fall Booking Discount** (Email) - Fall special pricing
2. **Last Chance Before Winter** (GBP) - Urgency GBP post
3. **Thanksgiving Ready** (SMS) - Holiday planning message

### Winter
1. **Plan Now for Spring** (Email) - Winter planning outreach
2. **Winter Planning Special** (Social) - Social media winter campaign
3. **New Year New Deck** (GBP) - New year GBP post

## Features

### 1. Template Library
- Browse all 12 templates by season or type
- Preview full template content
- One-click campaign creation from template
- Visual season grouping with icons

### 2. Campaign Management
- Create campaigns from templates
- Schedule for specific dates
- Track status: draft -> scheduled -> sent -> completed
- Search and filter by season/status
- Edit campaign details and notes

### 3. Calendar View
- Monthly calendar of scheduled campaigns
- Color-coded by season
- Click to view campaign details
- Navigate between months

### 4. Statistics Dashboard
- Total campaigns count
- Counts by status (draft, scheduled, sent, completed)
- Upcoming campaigns (next 7 days)

### 5. CSV Export
- Export all campaigns to CSV
- Includes template info, dates, status
- CSV injection protection

## Campaign Status Workflow

```
draft -> scheduled -> sent -> completed
```

- **Draft**: Initial state, not yet scheduled
- **Scheduled**: Has a scheduled date
- **Sent**: Campaign was sent/published
- **Completed**: Campaign completed (track results)

## User Workflow

1. **Browse Templates**: Go to Templates tab, filter by season/type
2. **Preview Template**: Click "Preview" to see full content
3. **Create Campaign**: Click "Use" to create campaign from template
4. **Schedule**: Set date and initial status
5. **Manage**: View in Campaigns tab, update status as needed
6. **Track**: Use Calendar to see scheduled campaigns

## localStorage Keys

- `hdd-campaigns`: Array of all campaigns
- `hdd-campaign-templates`: Array of custom templates (if any)

## No Backend

This project intentionally has no backend, API keys, or environment variables. All functionality is client-side JavaScript with localStorage persistence.

## Customization

### Updating Templates
Edit `src/types/index.ts` DEFAULT_TEMPLATES array to:
- Change phone numbers
- Update franchisee names
- Modify content and hashtags
- Add new templates

### Adding Custom Templates
Users can create custom templates via the UI (future feature) or by adding to localStorage.

## Brand Colors

- Primary: `#2F5233` (HDD Green)
- Primary Hover: `#234025`
- Season colors: Green (spring), Yellow (summer), Orange (fall), Blue (winter)

## Security

- CSP headers in index.html
- No external API calls
- CSV injection prevention in exports
- Console logging disabled in production
