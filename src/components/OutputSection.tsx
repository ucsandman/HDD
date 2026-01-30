import { useEffect, useRef } from 'react';
import { MessageCard } from './MessageCard';
import type { GeneratedMessages } from '../types';

interface OutputSectionProps {
  messages: GeneratedMessages;
}

export function OutputSection({ messages }: OutputSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to output section when messages are generated
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [messages]);

  return (
    <div ref={sectionRef} className="space-y-6 pt-6">
      <h2 className="text-lg font-semibold text-slate-800">Generated Messages</h2>

      <MessageCard
        title="Day 3: SMS Message"
        timing="Send 3 days after project completion"
        content={messages.sms}
        characterCount={messages.sms.length}
      />

      <MessageCard
        title="Day 7: Email"
        timing="Send 7 days after project completion"
        content={messages.emailBody}
        secondaryContent={{
          label: 'Subject',
          content: messages.emailSubject,
        }}
      />

      <MessageCard
        title="Day 14: Thank You Card"
        timing="Mail 14 days after project completion"
        content={messages.thankYouCard}
      />
    </div>
  );
}
