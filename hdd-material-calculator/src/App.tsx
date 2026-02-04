import { useState } from 'react';
import type { DeckConfig, CalculationResult, SavedCalculation } from './types';
import { calculateMaterials, getDefaultConfig } from './utils/calculations';
import { loadCalculations, saveCalculation, deleteCalculation } from './utils/storage';
import { Header } from './components/Header';
import { DeckConfigForm } from './components/DeckConfigForm';
import { MaterialsList } from './components/MaterialsList';
import { SavedCalculations } from './components/SavedCalculations';

type View = 'calculator' | 'saved';

export default function App() {
  const [view, setView] = useState<View>('calculator');
  const [config, setConfig] = useState<DeckConfig>(getDefaultConfig());
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [savedCalcs, setSavedCalcs] = useState<SavedCalculation[]>(() => loadCalculations());

  const handleCalculate = () => {
    const newResult = calculateMaterials(config);
    setResult(newResult);
  };

  const handleSave = (name: string, customerName?: string, projectAddress?: string) => {
    if (!result) return;
    const saved = saveCalculation(name, result, customerName, projectAddress);
    setSavedCalcs([saved, ...savedCalcs.filter(c => c.id !== saved.id)]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this saved calculation?')) {
      deleteCalculation(id);
      setSavedCalcs(savedCalcs.filter(c => c.id !== id));
    }
  };

  const handleLoad = (saved: SavedCalculation) => {
    setConfig(saved.result.config);
    setResult(saved.result);
    setView('calculator');
  };

  const handleReset = () => {
    setConfig(getDefaultConfig());
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        view={view}
        onViewChange={setView}
        savedCount={savedCalcs.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DeckConfigForm
              config={config}
              onChange={setConfig}
              onCalculate={handleCalculate}
              onReset={handleReset}
            />

            <MaterialsList
              result={result}
              onSave={handleSave}
            />
          </div>
        )}

        {view === 'saved' && (
          <SavedCalculations
            calculations={savedCalcs}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
