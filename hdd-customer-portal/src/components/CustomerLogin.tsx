import { useState } from 'react';

interface CustomerLoginProps {
  onLogin: (accessCode: string) => boolean;
  error: string | null;
}

export function CustomerLogin({ onLogin, error }: CustomerLoginProps) {
  const [accessCode, setAccessCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setIsSubmitting(true);
    const success = onLogin(accessCode.trim());
    if (!success) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2F5233] to-[#1a2e1d] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#2F5233] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">HDD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-gray-600 mt-2">
            Enter your access code to view your project status
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-1">
              Access Code
            </label>
            <input
              type="text"
              id="accessCode"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value.toUpperCase())}
              placeholder="e.g., SMITH2024"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent text-lg tracking-wider uppercase"
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !accessCode.trim()}
            className="w-full py-3 bg-[#2F5233] text-white rounded-lg font-medium hover:bg-[#3d6b43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Checking...' : 'View My Project'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Your access code was provided in your welcome email.
            <br />
            Contact us if you need assistance.
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Demo code: <span className="font-mono">SMITH2024</span>
          </p>
        </div>
      </div>
    </div>
  );
}
