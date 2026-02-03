import { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ConversionFunnel } from './components/ConversionFunnel';
import { QuoteList } from './components/QuoteList';
import { QuoteForm } from './components/QuoteForm';
import { QuoteDetail } from './components/QuoteDetail';
import { useQuotes } from './hooks/useQuotes';
import { exportQuotesCSV } from './utils/storage';
import type { Quote, QuoteStatus } from './types';
import { STATUS_LABELS } from './types';

function App() {
  const { quotes, addQuote, updateQuote, deleteQuote, addFollowUpEvent } = useQuotes();
  const [showForm, setShowForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = quotes.filter((quote) => {
    if (filterStatus !== 'all' && quote.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        quote.customerName.toLowerCase().includes(search) ||
        quote.customerEmail.toLowerCase().includes(search) ||
        quote.projectType.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleAddQuote = (quoteData: Parameters<typeof addQuote>[0]) => {
    addQuote(quoteData);
    setShowForm(false);
  };

  const handleUpdateStatus = (status: QuoteStatus) => {
    if (selectedQuote) {
      updateQuote(selectedQuote.id, { status });
      setSelectedQuote({ ...selectedQuote, status });
    }
  };

  const handleAddFollowUp = (event: Parameters<typeof addFollowUpEvent>[1]) => {
    if (selectedQuote) {
      addFollowUpEvent(selectedQuote.id, event);
      // Refresh selected quote
      const updated = quotes.find((q) => q.id === selectedQuote.id);
      if (updated) setSelectedQuote(updated);
    }
  };

  const handleDeleteQuote = () => {
    if (selectedQuote) {
      deleteQuote(selectedQuote.id);
      setSelectedQuote(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Dashboard quotes={quotes} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as QuoteStatus | 'all')}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                + Add Quote
              </button>
            </div>

            <QuoteList
              quotes={filteredQuotes}
              onSelectQuote={setSelectedQuote}
            />
          </div>

          <div>
            <ConversionFunnel quotes={quotes} />

            {quotes.length > 0 && (
              <button
                onClick={() => exportQuotesCSV(quotes)}
                className="w-full mt-4 px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors"
              >
                📥 Export CSV
              </button>
            )}
          </div>
        </div>
      </main>

      {showForm && (
        <QuoteForm onSubmit={handleAddQuote} onCancel={() => setShowForm(false)} />
      )}

      {selectedQuote && (
        <QuoteDetail
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddFollowUp={handleAddFollowUp}
          onDelete={handleDeleteQuote}
        />
      )}

      <footer className="text-center py-6 text-sm text-slate-500">
        Hickory Dickory Decks Quote Follow-Up Tracker
      </footer>
    </div>
  );
}

export default App;
