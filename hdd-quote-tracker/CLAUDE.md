# HDD Quote Follow-Up Tracker

## Overview

Quote follow-up tracking tool for Hickory Dickory Decks franchisees. Track quotes from the Quote Calculator and automate follow-up sequences for abandoned quotes.

## Architecture

- **Frontend only**: No backend, all logic runs client-side
- **State**: React useState + custom hooks for quote management
- **Persistence**: localStorage for all quote data
- **Styling**: Tailwind CSS v4 via @tailwindcss/postcss

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, status enums, constants |
| `src/utils/templates.ts` | Follow-up message templates (24h, 72h, 7d) |
| `src/utils/dateUtils.ts` | Date calculations, next follow-up logic |
| `src/utils/storage.ts` | localStorage persistence, CSV export |
| `src/hooks/useQuotes.ts` | Quote CRUD operations, follow-up tracking |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper |
| `src/components/Dashboard.tsx` | Stats cards (total, pending, conversion, avg value) |
| `src/components/ConversionFunnel.tsx` | Visual funnel chart |
| `src/components/QuoteList.tsx` | Table view with status badges |
| `src/components/QuoteDetail.tsx` | Modal with tabs (details, history, templates) |
| `src/components/QuoteForm.tsx` | Add new quote form |

## Commands

```bash
npm run dev     # Development server at localhost:5179
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Data Model

### Quote
```typescript
{
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  projectType: string;
  squareFootage: number;
  material: string;
  estimatedTotal: number;
  status: 'sent' | 'viewed' | 'followup1' | 'followup2' | 'followup3' | 'closed_won' | 'closed_lost';
  createdAt: string;
  lastFollowUp: string | null;
  nextFollowUp: string | null;
  notes: string;
  followUpHistory: FollowUpEvent[];
}
```

### FollowUpEvent
```typescript
{
  id: string;
  date: string;
  type: 'sms' | 'email' | 'call';
  message: string;
  response?: string;
}
```

## Follow-Up Sequence

Default timeline:
1. **24 hours** - SMS follow-up (short, friendly check-in)
2. **72 hours** - Email follow-up (full quote details + benefits)
3. **7 days** - SMS "last chance" message
4. **14 days** - Auto-close as lost (if no response)

## Features

### Dashboard
- Total quotes count
- Pending follow-ups (overdue items highlighted)
- Conversion rate (closed won / total)
- Average quote value

### Quote Management
- Add new quotes with customer details
- Filter by status
- Search by name, email, or project type
- Export to CSV

### Quote Detail View
Three tabs:
1. **Details** - Customer info, project details, status updates
2. **History** - Timeline of all follow-up communications
3. **Templates** - Pre-generated messages ready to copy

### Follow-Up Actions
- Record SMS, email, or call interactions
- Auto-advance status on follow-up
- Copy template messages to clipboard
- Track customer responses

### Message Templates
All templates use variable substitution:
- `{{name}}` - Customer first name
- `{{fullName}}` - Customer full name
- `{{franchisee}}` - Franchisee name
- `{{projectType}}` - Project type (lowercase)
- `{{total}}` - Estimated total (formatted)
- `{{sqft}}` - Square footage
- `{{material}}` - Material type
- `{{phone}}` - Franchisee phone

## Status Workflow

```
sent → viewed → followup1 → followup2 → followup3 → closed_won/closed_lost
```

Status can be manually updated at any time from the detail view.

## Data Flow

1. User creates quote → saved to localStorage
2. Next follow-up date calculated based on status
3. Dashboard shows overdue items
4. User clicks quote → detail modal opens
5. User records follow-up → history updated, status advances
6. Templates auto-generate from quote data

## No Backend

This project intentionally has no backend, API keys, or environment variables. All functionality is client-side JavaScript with localStorage persistence.

## Franchise Configuration

Franchisee name and phone number are hardcoded in `src/utils/templates.ts`:
- `franchiseeName` - Nathan Ricke
- `franchiseePhone` - (513) 555-1234
- `companyName` - Hickory Dickory Decks

Update these values to match your franchise.

## CSV Export

Export includes all quote fields:
- Customer info (name, phone, email)
- Project details (type, sqft, material, total)
- Status and timestamps
- Notes

File naming: `hdd-quotes-YYYY-MM-DD.csv`
