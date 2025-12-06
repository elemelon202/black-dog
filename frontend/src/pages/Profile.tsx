import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Building } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-brand-900 mb-8">My Profile</h1>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-brand-900">{user.full_name}</h2>
            <p className="text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-600">
            <Mail className="h-5 w-5" />
            <span>{user.email}</span>
          </div>

          {user.phone && (
            <div className="flex items-center space-x-3 text-gray-600">
              <Phone className="h-5 w-5" />
              <span>{user.phone}</span>
            </div>
          )}

          {user.company_name && (
            <div className="flex items-center space-x-3 text-gray-600">
              <Building className="h-5 w-5" />
              <span>{user.company_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
