interface HeaderProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
}

export function Header({ onNavigate, currentView }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#2F5233] to-[#4a7c50] text-white py-6 px-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Before/After Slider</h1>
          <p className="text-green-100 mt-1">Hickory Dickory Decks Cincinnati</p>
        </div>
        {onNavigate && (
          <nav className="flex gap-2">
            <button
              onClick={() => onNavigate('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'list'
                  ? 'bg-white text-[#2F5233]'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => onNavigate('create')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'create'
                  ? 'bg-white text-[#2F5233]'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              + Create New
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
