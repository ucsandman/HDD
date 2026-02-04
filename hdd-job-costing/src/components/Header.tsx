interface HeaderProps {
  currentView: 'list' | 'create' | 'detail';
  onNavigate: (view: 'list' | 'create') => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  return (
    <header className="bg-[#2F5233] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="text-xl font-bold">HDD Job Costing</h1>
              <p className="text-green-200 text-sm">Track project costs & profitability</p>
            </div>
          </div>

          <nav className="flex gap-2">
            <button
              onClick={() => onNavigate('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'list'
                  ? 'bg-white text-[#2F5233] font-medium'
                  : 'bg-green-700 hover:bg-green-600'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => onNavigate('create')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentView === 'create'
                  ? 'bg-white text-[#2F5233] font-medium'
                  : 'bg-green-700 hover:bg-green-600'
              }`}
            >
              + New Project
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
