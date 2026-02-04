interface HeaderProps {
  currentView: 'prices' | 'materials' | 'suppliers';
  onNavigate: (view: 'prices' | 'materials' | 'suppliers') => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const tabs = [
    { id: 'prices' as const, label: 'Price Comparison' },
    { id: 'materials' as const, label: 'Materials' },
    { id: 'suppliers' as const, label: 'Suppliers' },
  ];

  return (
    <header className="bg-[#2F5233] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <div>
              <h1 className="text-xl font-bold">HDD Supplier Tracker</h1>
              <p className="text-green-200 text-sm">Compare prices across suppliers</p>
            </div>
          </div>

          <nav className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === tab.id
                    ? 'bg-white text-[#2F5233] font-medium'
                    : 'bg-green-700 hover:bg-green-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
