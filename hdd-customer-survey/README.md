# HDD Customer Survey

Post-project satisfaction surveys with NPS scoring for Hickory Dickory Decks.

## Features

- Create and track customer satisfaction surveys
- NPS (Net Promoter Score) calculation and visualization
- Customer-facing survey form via unique access codes
- Response analytics with charts
- CSV export for reporting
- Demo mode to preview customer experience

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5188 in your browser.

## Usage

### Admin View
1. Click "New Survey" to create a survey for a customer
2. Copy the survey link and send to customer
3. Mark as "Sent" when delivered
4. View responses once completed

### Customer View
Customers access surveys via URL: `http://localhost:5188/?code=ABCD1234`

### Demo Mode
Click "Demo Customer View" to preview the customer experience.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## NPS Scoring

- **Promoters (9-10)**: Will recommend
- **Passives (7-8)**: Satisfied but not enthusiastic
- **Detractors (0-6)**: May damage reputation

**NPS = % Promoters - % Detractors** (ranges -100 to +100)
