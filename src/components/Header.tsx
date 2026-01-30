export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            HDD
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              HDD Review Request Generator
            </h1>
            <p className="text-sm text-slate-500">
              Generate personalized review request messages
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
