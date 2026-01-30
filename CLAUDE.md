# HDD Review Request Generator

## Overview

Static React app for generating personalized review request messages for Hickory Dickory Decks franchisees.

## Architecture

- **Frontend only**: No backend, all logic runs client-side
- **State**: React useState for form data and generated messages
- **Persistence**: localStorage for franchisee name and review link (survives page reload)
- **Styling**: Tailwind CSS v4 via @tailwindcss/postcss

## Key Files

| File | Purpose |
|------|---------|
| `src/utils/generateMessages.ts` | Message template logic with SMS fallback for length |
| `src/components/InputForm.tsx` | Form with validation and localStorage persistence |
| `src/components/MessageCard.tsx` | Reusable card with copy buttons and character count |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper with error handling |
| `src/types/index.ts` | FormData, GeneratedMessages interfaces, PROJECT_TYPES constant |

## Commands

```bash
npm run dev     # Development server at localhost:5173
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Message Templates

Three touchpoints generated from single form submission:

1. **Day 3: SMS** (max 320 chars)
   - Uses shorter fallback template if primary exceeds limit
   - Shows character count and segment indicator

2. **Day 7: Email**
   - Subject line with project type and customer name
   - Body with city references and review link

3. **Day 14: Thank You Card**
   - Uses full customer name (first + last)
   - No review link (meant for physical card)

## Form Fields

| Field | Validation | Persisted |
|-------|------------|-----------|
| Customer First Name | Required, min 1 char | No |
| Customer Last Name | Required, min 1 char | No |
| Project Type | Required, dropdown selection | No |
| City | Required, min 2 chars | No |
| Franchisee First Name | Required, min 1 char | Yes |
| Google Review Link | Required, valid URL | Yes |

## Data Flow

1. User fills form → validation on blur and submit
2. Submit triggers `generateMessages(formData)`
3. Returns `GeneratedMessages` object with all 4 strings
4. OutputSection renders MessageCard for each
5. Copy buttons use `navigator.clipboard.writeText()`

## No Backend

This project intentionally has no backend, API keys, or environment variables. All functionality is client-side JavaScript.
