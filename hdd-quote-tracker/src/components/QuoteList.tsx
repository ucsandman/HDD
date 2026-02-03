import type { Quote } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDate, getDaysOld, isOverdue } from '../utils/dateUtils';

interface QuoteListProps {
  quotes: Quote[];
  onSelectQuote: (quote: Quote) => void;
}

export function QuoteList({ quotes, onSelectQuote }: QuoteListProps) {
  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">No quotes yet</h3>
        <p className="text-slate-600">Add your first quote to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">
                Project
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">
                Age
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">
                Next Follow-Up
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {quotes.map((quote) => {
              const daysOld = getDaysOld(quote.createdAt);
              const overdue = isOverdue(quote.nextFollowUp);

              return (
                <tr
                  key={quote.id}
                  onClick={() => onSelectQuote(quote)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {quote.customerName}
                    </div>
                    <div className="text-sm text-slate-500">{quote.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-900">{quote.projectType}</div>
                    <div className="text-xs text-slate-500">
                      {quote.squareFootage > 0 && `${quote.squareFootage} sq ft • `}
                      {quote.material}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    ${quote.estimatedTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quote.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {daysOld} day{daysOld !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3">
                    {quote.nextFollowUp ? (
                      <span
                        className={`text-sm ${
                          overdue ? 'text-red-600 font-medium' : 'text-slate-600'
                        }`}
                      >
                        {overdue && '⚠️ '}
                        {formatDate(quote.nextFollowUp)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
