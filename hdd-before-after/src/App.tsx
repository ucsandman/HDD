import { useState } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ComparisonList } from './components/ComparisonList';
import { ComparisonForm } from './components/ComparisonForm';
import { ComparisonDetail } from './components/ComparisonDetail';
import { useComparisons } from './hooks/useComparisons';
import type { SliderComparison } from './types';
import { DEMO_COMPARISONS } from './types';

type View = 'list' | 'create';

function App() {
  const { comparisons, addComparison, deleteComparison } = useComparisons();
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedComparison, setSelectedComparison] = useState<SliderComparison | null>(null);
  const [showDemoData, setShowDemoData] = useState(false);

  // Combine real comparisons with demo data if enabled
  const displayComparisons = showDemoData
    ? [...comparisons, ...DEMO_COMPARISONS]
    : comparisons;

  const handleAddComparison = (data: Parameters<typeof addComparison>[0]) => {
    addComparison(data);
    setCurrentView('list');
  };

  const handleDelete = (id: string) => {
    const deleted = deleteComparison(id);
    if (deleted) {
      setSelectedComparison(null);
    }
  };

  const handleSelectComparison = (comparison: SliderComparison) => {
    setSelectedComparison(comparison);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onNavigate={(view) => setCurrentView(view as View)}
        currentView={currentView}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <StatsBar comparisons={displayComparisons} />

        {currentView === 'list' && (
          <>
            {/* Empty state with demo toggle */}
            {comparisons.length === 0 && (
              <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">
                  <span className="font-medium">Tip:</span> Create your first
                  before/after comparison, or enable demo data to see examples.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDemoData}
                    onChange={(e) => setShowDemoData(e.target.checked)}
                    className="rounded text-[#2F5233] focus:ring-[#2F5233]"
                  />
                  <span className="text-sm text-amber-800">Show demo data</span>
                </label>
              </div>
            )}

            <ComparisonList
              comparisons={displayComparisons}
              onSelect={handleSelectComparison}
            />
          </>
        )}

        {currentView === 'create' && (
          <ComparisonForm
            onSubmit={handleAddComparison}
            onCancel={() => setCurrentView('list')}
          />
        )}
      </main>

      {selectedComparison && (
        <ComparisonDetail
          comparison={selectedComparison}
          onClose={() => setSelectedComparison(null)}
          onDelete={handleDelete}
        />
      )}

      <footer className="text-center py-6 text-sm text-slate-500">
        Hickory Dickory Decks Before/After Slider Tool
      </footer>
    </div>
  );
}

export default App;
