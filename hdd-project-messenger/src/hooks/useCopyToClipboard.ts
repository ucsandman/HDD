import { useState } from 'react';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      // Only log in development mode
      if (import.meta.env.DEV) {
        console.error('Failed to copy to clipboard:', error);
      }
      return false;
    }
  };

  return { copied, copyToClipboard };
}
