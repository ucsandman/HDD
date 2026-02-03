import { useState } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { OutputSection } from './components/OutputSection';
import { generateMessages } from './utils/generateMessages';
import type { FormData, GeneratedMessages } from './types';

function App() {
  const [messages, setMessages] = useState<GeneratedMessages | null>(null);

  const handleSubmit = (data: FormData) => {
    const generated = generateMessages(data);
    setMessages(generated);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Project Details
          </h2>
          <InputForm onSubmit={handleSubmit} />
        </div>

        {messages && <OutputSection messages={messages} />}
      </main>

      <footer className="text-center py-6 text-sm text-slate-500">
        Hickory Dickory Decks Review Request Generator
      </footer>
    </div>
  );
}

export default App;
