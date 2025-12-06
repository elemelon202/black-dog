import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function DemoModeBanner() {
  const { user } = useAuth();

  if (!user?.demo_user) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium">
      <AlertTriangle className="inline-block w-4 h-4 mr-2 -mt-0.5" />
      Demo Mode - Data modifications are disabled. Feel free to explore!
    </div>
  );
}
