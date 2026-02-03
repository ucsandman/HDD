# HDD Project Update Messenger

## Overview

React application for generating and managing automated milestone communications during active deck construction projects. Keeps customers informed at each stage of the build process.

## Architecture

- **Frontend only**: No backend, all logic runs client-side
- **State**: React hooks (useState) for UI state, custom useProjects hook for project management
- **Persistence**: localStorage for all project data (survives page reload)
- **Styling**: Tailwind CSS v4 via @tailwindcss/postcss
- **Message Generation**: Template-based automatic message generation for each status change

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4

## Key Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, status enums, and constants |
| `src/hooks/useProjects.ts` | Project CRUD operations and status management |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper |
| `src/utils/messageTemplates.ts` | Auto-generated message templates for each status |
| `src/utils/storage.ts` | localStorage persistence layer |
| `src/utils/helpers.ts` | Utility functions for dates, stats, validation |
| `src/components/Header.tsx` | App header with branding |
| `src/components/StatsBar.tsx` | Dashboard statistics display |
| `src/components/ProjectCard.tsx` | Project list item card |
| `src/components/ProjectForm.tsx` | Create/edit project form with validation |
| `src/components/ProjectDetail.tsx` | Full project detail modal |
| `src/components/MessageCard.tsx` | Reusable message display with copy button |

## Commands

```bash
npm run dev     # Development server at localhost:5179
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

## Project Status Workflow

```
quoted → sold → materials_ordered → materials_received →
scheduled → in_progress → inspection_scheduled → complete
```

Each status transition automatically generates:
1. SMS message (short, mobile-friendly)
2. Email message (subject + body with details)

## Message Templates

### Sold
- SMS: Project confirmed, next steps coming soon
- Email: Welcome message with timeline expectations

### Materials Ordered
- SMS: Materials ordered with expected arrival date
- Email: Order confirmation with arrival details

### Materials Received
- SMS: Materials arrived, scheduling build date
- Email: Quality inspection passed, scheduling update

### Scheduled
- SMS: Build date confirmed, crew arrival time
- Email: Detailed arrival info, what to expect, preparation tips

### In Progress
- SMS: Crew on site, work underway
- Email: Work began, progress updates, contact info

### Inspection Scheduled
- SMS: Build complete, inspection date
- Email: Construction finished, inspection details, what's next

### Complete
- SMS: Project ready to enjoy, thank you
- Email: Congratulations, warranty info, maintenance tips, review request

## Data Model

### Project
```typescript
{
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  projectType: string (from PROJECT_TYPES)
  address: string
  status: ProjectStatus
  statusHistory: StatusChange[]
  scheduledStartDate: string | null
  estimatedCompletion: string | null
  notes: string
  photos: ProjectPhoto[]
  createdAt: string
  updatedAt: string
}
```

### StatusChange
```typescript
{
  id: string
  fromStatus: ProjectStatus | null
  toStatus: ProjectStatus
  changedAt: string
  notificationSent: boolean
  notificationType?: 'sms' | 'email' | 'both'
  messageContent?: string (JSON serialized)
}
```

## Features

### 1. Dashboard
- Stats overview (total, active, starting/completing this week, pending notifications)
- Filter projects by status
- Quick project creation

### 2. Project List
- Grid view of all projects
- Status badges with color coding
- Pending notification indicators
- Click to view details

### 3. Project Detail Modal
- Full customer information
- Status update interface
- Pending notifications queue
- Auto-generated messages with copy buttons
- Mark sent functionality (SMS/email/both)
- Full status history timeline
- Delete project

### 4. Message Management
- Auto-generate messages on status change
- Copy to clipboard functionality
- Character count for SMS
- Separate SMS and email templates
- Track which notifications have been sent

### 5. Status Updates
- Quick status change from detail view
- Optional date parameter for scheduled events
- Automatic message generation
- Notification queue management

## User Workflow

1. **Create Project**: Enter customer details, project type, address
2. **Update Status**: As project progresses, update status in detail view
3. **Review Messages**: Auto-generated messages appear in pending notifications
4. **Send Messages**: Copy message, send via preferred method, mark as sent
5. **Track History**: View complete status history with sent confirmations

## Future Enhancements (Not Implemented)

- Photo upload and sharing
- Weather delay notifications
- Integration with SMS/email APIs for direct sending
- Calendar view
- Bulk operations
- Export functionality
- Customer portal view

## No Backend

This project intentionally has no backend, API keys, or environment variables. All functionality is client-side JavaScript with localStorage persistence.

## Project Types

Custom Deck, Deck Replacement, Deck Repair, Deck Resurfacing, Pergola, Porch, Gazebo, Railings, Stairs, Screen Room, Sunroom, Other

## Validation

- Customer name (required)
- Phone number (required, 10-11 digits)
- Email (required, valid format)
- Project type (required)
- Address (required)

## localStorage Keys

- `hdd_projects`: Array of all projects
