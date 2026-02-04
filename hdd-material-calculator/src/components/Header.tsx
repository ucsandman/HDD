interface HeaderProps {
  view: 'calculator' | 'saved';
  onViewChange: (view: 'calculator' | 'saved') => void;
  savedCount: number;
}

export function Header({ view, onViewChange, savedCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2F5233] rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Material Calculator
              </h1>
              <p className="text-xs text-slate-500">
                Hickory Dickory Decks
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('calculator')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                view === 'calculator'
                  ? 'bg-[#2F5233] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => onViewChange('saved')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                view === 'saved'
                  ? 'bg-[#2F5233] text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Saved
              {savedCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    view === 'saved'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
