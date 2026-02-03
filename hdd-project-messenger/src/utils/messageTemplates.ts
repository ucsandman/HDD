import type { Project, ProjectStatus } from '../types';

interface MessageTemplate {
  sms: string;
  email?: {
    subject: string;
    body: string;
  };
}

export function generateStatusMessage(
  project: Project,
  newStatus: ProjectStatus,
  additionalData?: { date?: string }
): MessageTemplate {
  const { customerName, projectType } = project;
  const firstName = customerName.split(' ')[0];

  switch (newStatus) {
    case 'sold':
      return {
        sms: `Hi ${firstName}! Great news! Your ${projectType} project is confirmed. We'll be in touch soon with next steps. - Hickory Dickory Decks`,
        email: {
          subject: `Your ${projectType} Project is Confirmed!`,
          body: `Hi ${firstName},\n\nWe're excited to confirm your ${projectType} project! Our team will be reaching out soon with the next steps and project timeline.\n\nThank you for choosing Hickory Dickory Decks!\n\nBest regards,\nThe HDD Team`,
        },
      };

    case 'materials_ordered':
      return {
        sms: `Hi ${firstName}! We've ordered materials for your ${projectType}. ${additionalData?.date ? `Expected arrival: ${additionalData.date}.` : 'We\'ll update you when they arrive.'} - HDD`,
        email: {
          subject: `Materials Ordered for Your ${projectType}`,
          body: `Hi ${firstName},\n\nGood news! We've placed the order for all materials needed for your ${projectType} project.\n\n${additionalData?.date ? `Expected arrival: ${additionalData.date}` : 'We\'ll notify you as soon as they arrive.'}\n\nThanks for your patience!\n\nBest regards,\nThe HDD Team`,
        },
      };

    case 'materials_received':
      return {
        sms: `Hi ${firstName}! Your ${projectType} materials have arrived! We're scheduling your build date now and will confirm shortly. - HDD`,
        email: {
          subject: `Materials Received - Scheduling Your Build`,
          body: `Hi ${firstName},\n\nExcellent news! All materials for your ${projectType} have arrived and passed our quality inspection.\n\nOur scheduling team is working on your build date and will confirm with you within the next 1-2 business days.\n\nBest regards,\nThe HDD Team`,
        },
      };

    case 'scheduled':
      return {
        sms: `Hi ${firstName}! Your ${projectType} build is scheduled for ${additionalData?.date || '[DATE]'}. Our crew will arrive around 8am. Excited to get started! - HDD`,
        email: {
          subject: `Your ${projectType} Build is Scheduled!`,
          body: `Hi ${firstName},\n\nWe're excited to let you know your ${projectType} build is scheduled for:\n\n${additionalData?.date || '[DATE]'}\n\nOur crew will arrive around 8:00 AM. Please ensure the work area is clear and accessible.\n\nWhat to expect:\n• Our team will introduce themselves upon arrival\n• We'll protect your property during construction\n• Daily cleanup at the end of each day\n• We'll keep you updated on progress\n\nLooking forward to building your dream outdoor space!\n\nBest regards,\nThe HDD Team`,
        },
      };

    case 'in_progress':
      return {
        sms: `Hi ${firstName}! We're on site today building your ${projectType}! Expect great progress. We'll keep you updated. - HDD`,
        email: {
          subject: `Work Underway on Your ${projectType}`,
          body: `Hi ${firstName},\n\nOur crew is on site today and work is underway on your ${projectType}!\n\nWe're committed to quality craftsmanship and will keep you updated on our progress. Feel free to reach out if you have any questions.\n\nBest regards,\nThe HDD Team`,
        },
      };

    case 'inspection_scheduled':
      return {
        sms: `Hi ${firstName}! Your ${projectType} build is complete! Inspection scheduled for ${additionalData?.date || '[DATE]'}. Almost time to enjoy your new space! - HDD`,
        email: {
          subject: `Build Complete - Inspection Scheduled`,
          body: `Hi ${firstName},\n\nFantastic news! Construction on your ${projectType} is complete!\n\nWe have a final inspection scheduled for ${additionalData?.date || '[DATE]'} to ensure everything meets our quality standards and local building codes.\n\nOnce we pass inspection, your new outdoor space will be ready to enjoy!\n\nBest regards,\nThe HDD Team`,
        },
      };

    case 'complete':
      return {
        sms: `Congratulations ${firstName}! Your new ${projectType} is ready to enjoy! Thank you for choosing Hickory Dickory Decks. We'd love to hear about your experience! - HDD`,
        email: {
          subject: `Your ${projectType} is Complete!`,
          body: `Hi ${firstName},\n\nCongratulations! Your new ${projectType} is complete and ready for you to enjoy!\n\nIt's been a pleasure working with you. We take great pride in our craftsmanship and hope you love your new outdoor space.\n\nA few reminders:\n• Your warranty information will arrive separately\n• We recommend sealing/staining annually for longevity\n• Regular cleaning will keep it looking beautiful\n\nIf you're happy with your experience, we'd be grateful if you could share a review. And if you know anyone else who could use our services, we offer a referral program!\n\nThank you for choosing Hickory Dickory Decks!\n\nBest regards,\nThe HDD Team`,
        },
      };

    default:
      return {
        sms: `Hi ${firstName}! Update on your ${projectType} project. We'll be in touch soon with more details. - HDD`,
      };
  }
}

export function generateWeatherDelayMessage(
  project: Project,
  originalDate: string,
  reason: string = 'rain'
): MessageTemplate {
  const firstName = project.customerName.split(' ')[0];

  return {
    sms: `Hi ${firstName}! Weather update: ${reason} is forecasted for ${originalDate}. We'll reschedule your ${project.projectType} build and confirm the new date ASAP. - HDD`,
    email: {
      subject: `Weather Delay - Rescheduling Your ${project.projectType}`,
      body: `Hi ${firstName},\n\nWe're reaching out about your ${project.projectType} build scheduled for ${originalDate}.\n\nUnfortunately, ${reason} is in the forecast, which would compromise the quality of our work and your safety. We never compromise on quality, so we're rescheduling to ensure your project is built right.\n\nOur scheduling team will contact you within 24 hours with new available dates.\n\nWe appreciate your understanding and patience!\n\nBest regards,\nThe HDD Team`,
    },
  };
}

export function generatePhotoShareMessage(
  project: Project,
  photoCaption: string
): string {
  const firstName = project.customerName.split(' ')[0];

  return `Hi ${firstName}! Progress update on your ${project.projectType}: ${photoCaption}. Things are looking great! - HDD`;
}
