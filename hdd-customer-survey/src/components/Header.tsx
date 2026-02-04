interface HeaderProps {
  onDemoMode?: () => void;
  isDemoMode?: boolean;
}

export function Header({ onDemoMode, isDemoMode }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2F5233] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              HDD
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                HDD Customer Survey
              </h1>
              <p className="text-sm text-slate-500">
                Post-project satisfaction surveys with NPS scoring
              </p>
            </div>
          </div>
          {onDemoMode && (
            <button
              onClick={onDemoMode}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDemoMode
                  ? 'bg-[#2F5233] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDemoMode ? 'Exit Demo' : 'Demo Customer View'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
