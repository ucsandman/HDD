# HDD Seasonal Campaign Manager

Marketing campaign manager for Hickory Dickory Decks franchisees with pre-built seasonal templates.

## Features

- **Template Library**: 12 pre-built marketing templates across all seasons
- **Campaign Management**: Create, schedule, and track marketing campaigns
- **Calendar View**: Visual calendar of scheduled campaigns
- **Multi-Channel Support**: Email, SMS, Social Media, and Google Business templates
- **CSV Export**: Export campaign data for reporting

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5187 in your browser.

## Commands

```bash
npm run dev     # Development server at localhost:5187
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS v4
- Vite 7

## Project Structure

```
src/
  types/index.ts        # TypeScript interfaces and pre-built templates
  utils/storage.ts      # localStorage persistence, CSV export
  hooks/useCampaigns.ts # Campaign and template management
  components/
    Header.tsx          # Navigation with tabs
    StatsBar.tsx        # Campaign statistics
    TemplateLibrary.tsx # Browse templates by season/type
    TemplatePreview.tsx # Full template preview modal
    CampaignForm.tsx    # Create campaign from template
    CampaignList.tsx    # Campaign table with filters
    CampaignDetail.tsx  # View/edit campaign modal
    CalendarView.tsx    # Monthly calendar view
```

## Pre-Built Templates

### Spring (3 templates)
- Spring Deck Season is Here! (Email)
- Book Early for Summer (SMS)
- Spring Cleaning Special (GBP)

### Summer (3 templates)
- Perfect Deck Weather (Email)
- Summer Entertaining Ready (Social)
- Beat the Heat with New Deck (SMS)

### Fall (3 templates)
- Fall Booking Discount (Email)
- Last Chance Before Winter (GBP)
- Thanksgiving Ready (SMS)

### Winter (3 templates)
- Plan Now for Spring (Email)
- Winter Planning Special (Social)
- New Year New Deck (GBP)

## Data Persistence

All data is stored in localStorage:
- `hdd-campaigns`: Campaign data
- `hdd-campaign-templates`: Custom templates (if any)

No backend or API keys required.

## Franchise Configuration

Templates include placeholder contact information. To customize:
- Edit `src/types/index.ts` DEFAULT_TEMPLATES
- Update phone numbers, names, and hashtags

## License

Private - Hickory Dickory Decks Cincinnati
