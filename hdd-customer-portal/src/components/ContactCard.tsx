import { useState } from 'react';

interface ContactCardProps {
  crewLeader?: string;
  onSendMessage: (message: string) => void;
}

export function ContactCard({ crewLeader, onSendMessage }: ContactCardProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    onSendMessage(message.trim());

    setTimeout(() => {
      setMessage('');
      setIsSending(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>

      <div className="space-y-4">
        {/* Crew Leader Info */}
        {crewLeader && (
          <div className="flex items-center gap-3 p-3 bg-[#2F5233]/5 rounded-lg">
            <div className="w-10 h-10 bg-[#2F5233] rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {crewLeader.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Your Crew Leader</p>
              <p className="font-medium text-gray-900">{crewLeader}</p>
            </div>
          </div>
        )}

        {/* Contact Methods */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:+15135551234"
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">📞</span>
            <div>
              <p className="text-xs text-gray-500">Call Us</p>
              <p className="text-sm font-medium text-gray-900">(513) 555-1234</p>
            </div>
          </a>

          <a
            href="mailto:info@hickorydickorydecks.com"
            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">✉️</span>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">info@hdd.com</p>
            </div>
          </a>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Send a Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Questions or comments about your project..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
            />
          </div>

          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Message sent! We'll get back to you soon.
            </div>
          )}

          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="w-full py-2 bg-[#2F5233] text-white rounded-lg font-medium hover:bg-[#3d6b43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
