# HDD Project Update Messenger

Automated milestone communication for Hickory Dickory Decks active construction projects.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5180](http://localhost:5180)

## Features

- Track projects through 8 construction phases
- Auto-generate SMS and email messages for each milestone
- Dashboard with project statistics
- Filter by status
- Pending notification queue
- Message copy to clipboard
- Track sent notifications
- Complete status history

## Project Statuses

1. **Quoted** - Estimate provided
2. **Sold** - Project confirmed
3. **Materials Ordered** - Materials on order
4. **Materials Received** - Materials arrived
5. **Scheduled** - Build date set
6. **In Progress** - Construction underway
7. **Inspection Scheduled** - Build complete, inspection pending
8. **Complete** - Project finished

## Usage

### Create a Project

1. Click "+ New Project"
2. Enter customer information
3. Select project type and status
4. Add optional dates and notes
5. Click "Create Project"

### Update Project Status

1. Click on a project card
2. Click "Change Status"
3. Select new status
4. Add optional date (for scheduled events)
5. Click "Update Status & Generate Message"

### Send Notifications

1. View project detail
2. Review auto-generated messages in "Pending Notifications"
3. Click "Copy" to copy message
4. Send via your SMS/email platform
5. Click "Mark Sent" to track

## Message Templates

Each status change generates:
- **SMS**: Short, mobile-friendly message (~160 chars)
- **Email**: Subject line + detailed body

Messages automatically include:
- Customer first name
- Project type
- Relevant dates
- Next steps

## Data Storage

All data stored locally in browser localStorage. No backend required.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Browser Support

Modern browsers with localStorage and Clipboard API support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Private - Hickory Dickory Decks internal tool
