import { useState, useEffect } from 'react';
import type { Quote, FollowUpEvent } from '../types';
import { loadQuotes, saveQuotes } from '../utils/storage';
import { calculateNextFollowUp } from '../utils/dateUtils';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>(() => loadQuotes());

  useEffect(() => {
    saveQuotes(quotes);
  }, [quotes]);

  const addQuote = (quote: Omit<Quote, 'id' | 'createdAt' | 'lastFollowUp' | 'nextFollowUp' | 'followUpHistory'>) => {
    const now = new Date().toISOString();
    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      createdAt: now,
      lastFollowUp: null,
      nextFollowUp: calculateNextFollowUp({
        ...quote,
        id: '',
        createdAt: now,
        lastFollowUp: null,
        nextFollowUp: null,
        followUpHistory: [],
      }),
      followUpHistory: [],
    };
    setQuotes([newQuote, ...quotes]);
    return newQuote;
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(
      quotes.map((quote) =>
        quote.id === id ? { ...quote, ...updates } : quote
      )
    );
  };

  const deleteQuote = (id: string) => {
    if (window.confirm('Delete this quote? This cannot be undone.')) {
      setQuotes(quotes.filter((quote) => quote.id !== id));
    }
  };

  const addFollowUpEvent = (quoteId: string, event: Omit<FollowUpEvent, 'id'>) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return;

    const newEvent: FollowUpEvent = {
      ...event,
      id: Date.now().toString(),
    };

    const updatedQuote = {
      ...quote,
      followUpHistory: [...quote.followUpHistory, newEvent],
      lastFollowUp: event.date,
    };

    // Recalculate next follow-up
    updatedQuote.nextFollowUp = calculateNextFollowUp(updatedQuote);

    updateQuote(quoteId, updatedQuote);
  };

  return {
    quotes,
    addQuote,
    updateQuote,
    deleteQuote,
    addFollowUpEvent,
  };
}
