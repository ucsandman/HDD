import { useState } from 'react';
import type { Quote, QuoteStatus, FollowUpEvent } from '../types';
import { StatusBadge } from './StatusBadge';
import { MessageCard } from './MessageCard';
import { formatDateTime, getDaysOld } from '../utils/dateUtils';
import {
  generateFollowUp24h,
  generateFollowUp72h,
  generateFollowUp7d,
} from '../utils/templates';
import { STATUS_LABELS } from '../types';

interface QuoteDetailProps {
  quote: Quote;
  onClose: () => void;
  onUpdateStatus: (status: QuoteStatus) => void;
  onAddFollowUp: (event: Omit<FollowUpEvent, 'id'>) => void;
  onDelete: () => void;
}

export function QuoteDetail({
  quote,
  onClose,
  onUpdateStatus,
  onAddFollowUp,
  onDelete,
}: QuoteDetailProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'templates'>('details');

  const template24h = generateFollowUp24h(quote);
  const template72h = generateFollowUp72h(quote);
  const template7d = generateFollowUp7d(quote);

  const handleRecordFollowUp = (type: 'sms' | 'email' | 'call') => {
    const message = prompt(`Enter ${type.toUpperCase()} message sent:`);
    if (!message) return;

    onAddFollowUp({
      date: new Date().toISOString(),
      type,
      message,
    });

    // Auto-advance status
    if (quote.status === 'sent' || quote.status === 'viewed') {
      onUpdateStatus('followup1');
    } else if (quote.status === 'followup1') {
      onUpdateStatus('followup2');
    } else if (quote.status === 'followup2') {
      onUpdateStatus('followup3');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-green-800 text-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{quote.customerName}</h2>
              <p className="text-amber-100 mt-1">
                {quote.projectType} • ${quote.estimatedTotal.toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-amber-200 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <StatusBadge status={quote.status} />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
              {getDaysOld(quote.createdAt)} days old
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex">
            {(['details', 'history', 'templates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab
                    ? 'text-amber-800 border-b-2 border-amber-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Email
                  </label>
                  <p className="text-slate-900">{quote.customerEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Phone
                  </label>
                  <p className="text-slate-900">
                    {quote.customerPhone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Material
                  </label>
                  <p className="text-slate-900">{quote.material}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Square Footage
                  </label>
                  <p className="text-slate-900">
                    {quote.squareFootage > 0 ? `${quote.squareFootage} sq ft` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Created
                  </label>
                  <p className="text-slate-900">{formatDateTime(quote.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Last Follow-Up
                  </label>
                  <p className="text-slate-900">
                    {quote.lastFollowUp ? formatDateTime(quote.lastFollowUp) : 'None'}
                  </p>
                </div>
              </div>

              {quote.notes && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Notes
                  </label>
                  <p className="text-slate-900 whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(status as QuoteStatus)}
                      className={`px-3 py-2 text-sm font-medium rounded border ${
                        quote.status === status
                          ? 'bg-amber-800 text-white border-amber-800'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-amber-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {quote.followUpHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No follow-up history yet
                </div>
              ) : (
                quote.followUpHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 uppercase">
                          {event.type}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(event.date)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 whitespace-pre-wrap">
                        {event.message}
                      </p>
                      {event.response && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs font-medium text-slate-600 mb-1">
                            Customer Response:
                          </p>
                          <p className="text-sm text-slate-900">{event.response}</p>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <MessageCard
                title="24-Hour Follow-Up"
                message={template24h.message}
                type="sms"
              />
              <MessageCard
                title="72-Hour Follow-Up"
                subject={template72h.subject}
                message={template72h.message}
                type="email"
              />
              <MessageCard
                title="7-Day Follow-Up"
                message={template7d.message}
                type="sms"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onDelete}
              className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
            >
              Delete Quote
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleRecordFollowUp('call')}
                className="px-4 py-2 text-slate-700 bg-white hover:bg-slate-100 rounded-lg font-medium border border-slate-300"
              >
                📞 Call
              </button>
              <button
                onClick={() => handleRecordFollowUp('sms')}
                className="px-4 py-2 text-slate-700 bg-white hover:bg-slate-100 rounded-lg font-medium border border-slate-300"
              >
                💬 SMS
              </button>
              <button
                onClick={() => handleRecordFollowUp('email')}
                className="px-4 py-2 text-slate-700 bg-white hover:bg-slate-100 rounded-lg font-medium border border-slate-300"
              >
                📧 Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
