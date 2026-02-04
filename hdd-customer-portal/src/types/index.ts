// Project status for customer view
export type ProjectStatus =
  | 'quote_sent'
  | 'quote_accepted'
  | 'permit_pending'
  | 'permit_approved'
  | 'materials_ordered'
  | 'scheduled'
  | 'in_progress'
  | 'inspection_scheduled'
  | 'complete';

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; description: string }[] = [
  { value: 'quote_sent', label: 'Quote Sent', description: 'Your quote is ready for review' },
  { value: 'quote_accepted', label: 'Quote Accepted', description: 'Thank you! We\'re getting started' },
  { value: 'permit_pending', label: 'Permit Pending', description: 'Waiting for permit approval' },
  { value: 'permit_approved', label: 'Permit Approved', description: 'Permit received, ordering materials' },
  { value: 'materials_ordered', label: 'Materials Ordered', description: 'Materials are on their way' },
  { value: 'scheduled', label: 'Build Scheduled', description: 'Your build date is confirmed' },
  { value: 'in_progress', label: 'In Progress', description: 'Your deck is being built!' },
  { value: 'inspection_scheduled', label: 'Inspection Scheduled', description: 'Final inspection scheduled' },
  { value: 'complete', label: 'Complete', description: 'Your deck is ready to enjoy!' },
];

// Customer information
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  accessCode: string; // Simple code for portal access
  createdAt: string;
}

// Project visible to customer
export interface CustomerProject {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  quoteAmount?: number;
  scheduledDate?: string;
  estimatedCompletion?: string;
  crewLeader?: string;
  photos: ProjectPhoto[];
  updates: ProjectUpdate[];
  documents: ProjectDocument[];
  createdAt: string;
  updatedAt: string;
}

// Photo shared with customer
export interface ProjectPhoto {
  id: string;
  url: string;
  caption?: string;
  stage: 'before' | 'during' | 'after';
  uploadedAt: string;
}

// Status update/message for customer
export interface ProjectUpdate {
  id: string;
  message: string;
  date: string;
  isFromCustomer: boolean;
}

// Document (quote, contract, permit, warranty)
export interface ProjectDocument {
  id: string;
  name: string;
  type: 'quote' | 'contract' | 'permit' | 'warranty' | 'other';
  url?: string;
  uploadedAt: string;
}

// Message from customer
export interface CustomerMessage {
  id: string;
  projectId: string;
  customerId: string;
  message: string;
  sentAt: string;
  read: boolean;
}

// Portal session (admin view)
export interface PortalSession {
  customerId: string;
  customer: Customer;
  projects: CustomerProject[];
}

// Admin stats
export interface PortalStats {
  totalCustomers: number;
  activeProjects: number;
  pendingMessages: number;
  completedThisMonth: number;
}

// Demo data for testing
export const DEMO_CUSTOMER: Customer = {
  id: 'demo-customer-1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '(513) 555-1234',
  address: '123 Oak Street',
  city: 'Cincinnati',
  accessCode: 'SMITH2024',
  createdAt: '2024-01-15T00:00:00Z',
};

export const DEMO_PROJECT: CustomerProject = {
  id: 'demo-project-1',
  customerId: 'demo-customer-1',
  name: 'Smith Composite Deck',
  description: '16x20 Trex Transcend deck with cable railing',
  status: 'scheduled',
  quoteAmount: 18500,
  scheduledDate: '2026-02-10',
  estimatedCompletion: '2026-02-14',
  crewLeader: 'Mike',
  photos: [
    {
      id: 'photo-1',
      url: 'https://placehold.co/800x600/2F5233/white?text=Before+Photo',
      caption: 'Existing backyard before construction',
      stage: 'before',
      uploadedAt: '2024-01-20T00:00:00Z',
    },
  ],
  updates: [
    {
      id: 'update-1',
      message: 'Thank you for choosing Hickory Dickory Decks! Your quote has been sent.',
      date: '2024-01-15',
      isFromCustomer: false,
    },
    {
      id: 'update-2',
      message: 'Quote accepted! We\'ll begin the permit process.',
      date: '2024-01-18',
      isFromCustomer: false,
    },
    {
      id: 'update-3',
      message: 'Great news! Your permit has been approved.',
      date: '2024-01-25',
      isFromCustomer: false,
    },
    {
      id: 'update-4',
      message: 'Materials have been ordered and should arrive by Feb 5th.',
      date: '2024-02-01',
      isFromCustomer: false,
    },
    {
      id: 'update-5',
      message: 'Your build is scheduled for February 10th! Mike will be your crew leader.',
      date: '2024-02-03',
      isFromCustomer: false,
    },
  ],
  documents: [
    {
      id: 'doc-1',
      name: 'Project Quote',
      type: 'quote',
      uploadedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'doc-2',
      name: 'Signed Contract',
      type: 'contract',
      uploadedAt: '2024-01-18T00:00:00Z',
    },
    {
      id: 'doc-3',
      name: 'Building Permit',
      type: 'permit',
      uploadedAt: '2024-01-25T00:00:00Z',
    },
  ],
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-02-03T00:00:00Z',
};
