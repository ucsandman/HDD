import type { ReactNode } from 'react';

interface HeaderProps {
  activeTab: 'campaigns' | 'templates' | 'calendar';
  onTabChange: (tab: 'campaigns' | 'templates' | 'calendar') => void;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded-lg transition-colors ${
        active
          ? 'bg-[#2F5233] text-white'
          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2F5233] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              HDD
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Seasonal Campaign Manager
              </h1>
              <p className="text-sm text-slate-500">
                Pre-built marketing campaigns for every season
              </p>
            </div>
          </div>

          <nav className="flex gap-2">
            <TabButton
              active={activeTab === 'campaigns'}
              onClick={() => onTabChange('campaigns')}
            >
              Campaigns
            </TabButton>
            <TabButton
              active={activeTab === 'templates'}
              onClick={() => onTabChange('templates')}
            >
              Templates
            </TabButton>
            <TabButton
              active={activeTab === 'calendar'}
              onClick={() => onTabChange('calendar')}
            >
              Calendar
            </TabButton>
          </nav>
        </div>
      </div>
    </header>
  );
}
