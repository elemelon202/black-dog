import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DemoModeToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleDemoBlocked = (event: CustomEvent<{ message: string }>) => {
      setMessage(event.detail.message);
      setShow(true);
      // Auto-hide after 4 seconds
      setTimeout(() => setShow(false), 4000);
    };

    window.addEventListener('demo-mode-blocked', handleDemoBlocked as EventListener);
    return () => {
      window.removeEventListener('demo-mode-blocked', handleDemoBlocked as EventListener);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-amber-500 text-amber-950 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => setShow(false)}
          className="ml-2 hover:bg-amber-600 rounded p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
