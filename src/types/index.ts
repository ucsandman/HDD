export interface FormData {
  customerFirstName: string;
  customerLastName: string;
  projectType: string;
  city: string;
  franchiseeName: string;
  googleReviewLink: string;
}

export interface GeneratedMessages {
  sms: string;
  emailSubject: string;
  emailBody: string;
  thankYouCard: string;
}

export interface MessageCardProps {
  title: string;
  timing: string;
  content: string;
  secondaryContent?: {
    label: string;
    content: string;
  };
}

export const PROJECT_TYPES = [
  'Custom Deck',
  'Deck Replacement',
  'Deck Repair',
  'Deck Resurfacing',
  'Pergola',
  'Porch',
  'Gazebo',
  'Railings',
  'Stairs',
  'Screen Room',
  'Sunroom',
  'Other',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
