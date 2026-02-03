export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            HDD
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              HDD Project Update Messenger
            </h1>
            <p className="text-sm text-slate-500">
              Automated milestone communication for active projects
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
