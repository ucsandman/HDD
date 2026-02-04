# HDD Customer Survey

## Overview

React application for creating and tracking post-project customer satisfaction surveys with NPS (Net Promoter Score) scoring. Enables Hickory Dickory Decks franchisees to gather feedback after project completion.

## Architecture

- **Frontend only**: No backend, all logic runs client-side
- **State**: React hooks (useState) for UI state, custom useSurveys hook for survey management
- **Persistence**: localStorage for all survey data (survives page reload)
- **Styling**: Tailwind CSS v4 via @tailwindcss/postcss
- **Customer Access**: Unique access codes allow customers to fill out surveys via URL parameter

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, status enums, default questions |
| `src/hooks/useSurveys.ts` | Survey CRUD operations and stats calculation |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper |
| `src/utils/storage.ts` | localStorage persistence, NPS calculation, CSV export |
| `src/components/Header.tsx` | App header with branding and demo mode toggle |
| `src/components/StatsBar.tsx` | Dashboard statistics with NPS gauge |
| `src/components/NPSGauge.tsx` | Visual NPS score display (-100 to +100) |
| `src/components/SurveyList.tsx` | Survey table with status filtering |
| `src/components/SurveyForm.tsx` | Create new survey form |
| `src/components/SurveyDetail.tsx` | View survey details and responses |
| `src/components/SurveyPreview.tsx` | Preview customer-facing survey |
| `src/components/CustomerSurveyView.tsx` | Actual survey form customers fill out |
| `src/components/ResponseChart.tsx` | Bar chart visualization of responses |

## Commands

```bash
npm run dev     # Development server at localhost:5188
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Survey Status Workflow

```
pending → sent → completed
                 ↓
              expired
```

## NPS Scoring

- **Promoters (9-10)**: Loyal enthusiasts who will refer others
- **Passives (7-8)**: Satisfied but unenthusiastic
- **Detractors (0-6)**: Unhappy customers who may damage brand

**NPS Formula**: `(% Promoters - % Detractors) × 100`

Score ranges from -100 to +100:
- **70+**: Excellent
- **50-69**: Great
- **30-49**: Good
- **0-29**: Okay
- **-30 to -1**: Needs Work
- **Below -30**: Critical

## Default Survey Questions

1. **NPS (0-10)**: "How likely are you to recommend Hickory Dickory Decks?"
2. **Rating (1-5)**: "How satisfied are you with the quality of work?"
3. **Rating (1-5)**: "How would you rate our communication?"
4. **Rating (1-5)**: "How satisfied are you with the timeline?"
5. **Yes/No**: "Would you use us again for future projects?"
6. **Text**: "What did we do well?"
7. **Text**: "How could we improve?"

## Data Model

### Survey
```typescript
{
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  projectName: string
  status: 'pending' | 'sent' | 'completed' | 'expired'
  sentAt: string | null
  completedAt: string | null
  responses: SurveyResponse[]
  npsScore: number | null
  accessCode: string
  createdAt: string
  updatedAt: string
}
```

### SurveyResponse
```typescript
{
  questionId: string
  value: number | string | boolean
}
```

### SurveyStats
```typescript
{
  totalSent: number
  completed: number
  responseRate: number
  npsScore: number | null
  promoters: number
  passives: number
  detractors: number
}
```

## Features

### Admin View
- Dashboard with NPS gauge, response rate, category breakdown
- Survey list with status filtering
- Create new surveys for customers
- View survey details and responses
- Copy survey link to clipboard
- Mark surveys as sent/expired
- Delete surveys
- Export all data to CSV
- Preview customer view

### Customer View
- Access via URL with code parameter: `?code=ABCD1234`
- Mobile-friendly survey form
- NPS scoring (0-10 scale)
- Star ratings (1-5)
- Yes/No questions
- Text feedback fields
- Thank you confirmation on submit

### Demo Mode
- Preview customer experience without creating real survey
- Accessible via "Demo Customer View" button
- Simulates complete survey flow

## User Workflow

1. **Create Survey**: Enter customer name, email, and project name
2. **Copy Link**: Get unique survey URL with access code
3. **Send to Customer**: Email or text the link
4. **Mark as Sent**: Update status when survey is delivered
5. **Customer Completes**: Customer fills out survey via link
6. **Review Results**: View responses, NPS score, and analytics
7. **Export Data**: Download CSV for reporting

## localStorage Keys

- `hdd_surveys`: Array of all surveys

## Customer Access

Customers access their survey via URL parameter:
```
https://your-domain.com/?code=ABCD1234
```

The access code is an 8-character alphanumeric string generated when the survey is created.

## Security Notes

- No authentication required (localStorage only)
- Access codes are randomly generated
- CSV export includes CSV injection prevention
- No sensitive data transmitted over network

## Future Enhancements (Not Implemented)

- Email integration for automatic survey delivery
- Custom question configuration
- Multiple survey templates
- Response reminders
- Trend analysis over time
- Integration with Project Messenger for automatic post-completion surveys
