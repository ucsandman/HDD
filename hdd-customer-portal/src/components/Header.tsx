import type { Customer } from '../types';

interface HeaderProps {
  customer: Customer | null;
  onLogout?: () => void;
  isAdmin?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Header({ customer, onLogout, isAdmin, activeTab, onTabChange }: HeaderProps) {
  const adminTabs = ['dashboard', 'customers', 'projects', 'messages'];

  return (
    <header className="bg-[#2F5233] text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#2F5233] font-bold text-lg">HDD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {isAdmin ? 'Customer Portal Admin' : 'Customer Portal'}
              </h1>
              <p className="text-sm text-white/80">Hickory Dickory Decks</p>
            </div>
          </div>

          {customer && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-white/80">{customer.city}</p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>

        {isAdmin && onTabChange && (
          <nav className="mt-4 flex gap-2">
            {adminTabs.map(tab => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white text-[#2F5233]'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
