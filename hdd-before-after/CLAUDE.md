# HDD Before/After Slider

## Overview

Interactive before/after image comparison slider for Hickory Dickory Decks franchisees. Create stunning visual comparisons for social media and website use.

## Architecture

- **Frontend only**: No backend, all logic runs client-side
- **State**: React useState + custom hooks for comparison management
- **Persistence**: localStorage for all comparison data
- **Styling**: Tailwind CSS v4 via @tailwindcss/postcss

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, orientation types, demo data |
| `src/utils/storage.ts` | localStorage CRUD, embed code generation, HTML export |
| `src/hooks/useComparisons.ts` | Comparison CRUD operations |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper |
| `src/components/Header.tsx` | App header with navigation |
| `src/components/StatsBar.tsx` | Stats cards (total, horizontal, vertical, this month) |
| `src/components/ComparisonSlider.tsx` | Core interactive slider component |
| `src/components/ComparisonList.tsx` | Grid gallery of saved comparisons |
| `src/components/ComparisonForm.tsx` | Create new comparison form |
| `src/components/ComparisonDetail.tsx` | Detail modal with preview mode |
| `src/components/ExportModal.tsx` | Embed code and download options |

## Commands

```bash
npm run dev     # Development server at localhost:5186
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Data Model

### SliderComparison
```typescript
{
  id: string;
  name: string;
  projectName: string;
  beforeImage: {
    url: string;
    caption: string;
    uploadedAt: string;
  };
  afterImage: {
    url: string;
    caption: string;
    uploadedAt: string;
  };
  orientation: 'horizontal' | 'vertical';
  createdAt: string;
}
```

## Features

### Interactive Slider
- Drag handle to reveal before/after
- Click anywhere to jump to position
- Touch and mouse support
- Horizontal (left/right) or vertical (top/bottom) orientation
- Before/After labels

### Comparison Management
- Create comparisons with image URLs
- Preview images before saving
- View in fullscreen preview mode
- Delete comparisons

### Export Options
- Generate HTML embed code (self-contained with CSS/JS)
- Download as standalone HTML file
- Copy individual image URLs
- Side-by-side image preview

### Stats Dashboard
- Total comparisons count
- Horizontal vs vertical breakdown
- This month's count

## Slider Implementation

The slider uses CSS clip-path and percentage-based positioning:
1. After image is full-size background
2. Before image is clipped to the slider position
3. Handle tracks mouse/touch position
4. Labels indicate before/after sides

## Export Code

The embed code is fully self-contained:
- Inline CSS for styling
- Inline JavaScript for interactivity
- No external dependencies
- Works in any HTML page

## No Backend

This project intentionally has no backend, API keys, or environment variables. All functionality is client-side with localStorage persistence.

## Integration with Photo Manager

Images can be sourced from:
- Photo Manager tool (copy image URLs)
- Vercel Blob storage URLs
- Any external image URL (must be publicly accessible)

## HDD Brand Colors

- Primary Green: `#2F5233`
- Used in header gradient, buttons, slider handle, and labels

## Demo Data

Demo comparisons are available to showcase functionality:
- Thompson Deck Renovation (horizontal)
- Miller Pergola Project (vertical)

Enable via checkbox when no comparisons exist.
