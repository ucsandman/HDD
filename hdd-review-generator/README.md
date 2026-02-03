# HDD Review Request Generator

A standalone web application that generates personalized review request messages for Hickory Dickory Decks franchisees. Creates ready-to-copy SMS messages, emails, and thank you card text based on project and customer details.

## Features

- Generate Day 3 SMS, Day 7 Email, and Day 14 Thank You Card messages
- One-click copy to clipboard with visual feedback
- Form validation with inline error messages
- Form data persistence (franchisee name and review link saved to localStorage)
- Mobile responsive design
- SMS character count with segment warnings (1 segment: ≤160, 2 segments: ≤320)

## Tech Stack

- React 19 with TypeScript
- Tailwind CSS v4
- Vite 7

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd hdd-review-generator
npm install
```

### Development

```bash
npm run dev
```

Opens at http://localhost:5173

### Build

```bash
npm run build
```

Output is in the `dist/` directory, ready for static hosting.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Usage

1. Fill out the form with customer and project details:
   - Customer First Name
   - Customer Last Name
   - Project Type (Custom Deck, Deck Replacement, Pergola, etc.)
   - City
   - Franchisee First Name
   - Google Review Link

2. Click "Generate Messages" to create all three touchpoints

3. Use the Copy buttons to copy each message to your clipboard

4. Paste into your SMS app, email client, or card template

## Project Types

- Custom Deck
- Deck Replacement
- Deck Repair
- Deck Resurfacing
- Pergola
- Porch
- Gazebo
- Railings
- Stairs
- Screen Room
- Sunroom
- Other

## Deployment

This is a static site with no backend. Deploy the `dist/` folder to any static host:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

No environment variables required.

## Project Structure

```
src/
├── components/
│   ├── CopyButton.tsx      # Copy to clipboard with feedback
│   ├── Header.tsx          # App header with logo
│   ├── InputForm.tsx       # Form with validation and persistence
│   ├── MessageCard.tsx     # Reusable message display card
│   └── OutputSection.tsx   # Container for generated messages
├── hooks/
│   └── useCopyToClipboard.ts  # Clipboard API wrapper
├── types/
│   └── index.ts            # TypeScript interfaces
├── utils/
│   └── generateMessages.ts # Message template logic
├── App.tsx                 # Main application component
├── main.tsx                # Entry point
└── index.css               # Tailwind CSS import
```
