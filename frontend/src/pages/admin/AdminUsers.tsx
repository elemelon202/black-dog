import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Phone,
  Mail,
  Calendar,
  Plus,
  Trash2,
  X,
  Truck,
  ClipboardList,
  Shield
} from 'lucide-react';

type UserType = {
  id: string;
  attributes: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    full_name: string;
    role: string;
    created_at: string;
  };
};

type Tab = 'drivers' | 'dispatchers' | 'admins';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('drivers');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', activeTab],
    queryFn: async () => {
      const response = await adminApi.getUsers({ role: activeTab === 'dispatchers' ? 'dispatcher' : activeTab === 'admins' ? 'admin' : 'driver' });
      return response.data;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      phone: string;
      role: string;
    }) => adminApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowCreateModal(false);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteConfirmId(null);
    },
  });

  const users = data?.data || [];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'driver': return <Truck className="h-4 w-4" />;
      case 'dispatcher': return <ClipboardList className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'driver': return 'bg-blue-100 text-blue-800';
      case 'dispatcher': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">User Management</h1>
          <p className="text-gray-600">Manage staff accounts (drivers, dispatchers, admins)</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'drivers' as Tab, label: 'Drivers', icon: Truck },
            { id: 'dispatchers' as Tab, label: 'Dispatchers', icon: ClipboardList },
            { id: 'admins' as Tab, label: 'Admins', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-accent-500 text-accent-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">
            No {activeTab} yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add a new {activeTab === 'drivers' ? 'driver' : activeTab === 'dispatchers' ? 'dispatcher' : 'admin'} to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'drivers' ? 'Driver' : activeTab === 'dispatchers' ? 'Dispatcher' : 'Admin'}
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: UserType) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-brand-700 font-medium">
                            {user.attributes.first_name?.[0]}{user.attributes.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-brand-900">{user.attributes.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="flex items-center text-gray-600">
                          <Mail className="h-3 w-3 mr-2" />
                          {user.attributes.email}
                        </p>
                        {user.attributes.phone && (
                          <p className="flex items-center text-gray-600 mt-1">
                            <Phone className="h-3 w-3 mr-2" />
                            {user.attributes.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeClass(user.attributes.role)}`}>
                        {getRoleIcon(user.attributes.role)}
                        <span className="ml-1">{user.attributes.role}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(user.attributes.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {/* Don't allow deleting yourself */}
                      {user.id !== currentUser?.id?.toString() && (
                        <>
                          {deleteConfirmId === user.id ? (
                            <div className="flex items-center justify-end space-x-2">
                              <span className="text-sm text-red-600">Delete?</span>
                              <button
                                onClick={() => deleteUserMutation.mutate(Number(user.id))}
                                disabled={deleteUserMutation.isPending}
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                              >
                                {deleteUserMutation.isPending ? 'Deleting...' : 'Yes'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(user.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Staff Member</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createUserMutation.mutate({
                  email: formData.get('email') as string,
                  password: formData.get('password') as string,
                  first_name: formData.get('first_name') as string,
                  last_name: formData.get('last_name') as string,
                  phone: formData.get('phone') as string,
                  role: formData.get('role') as string,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" name="first_name" required className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" name="last_name" required className="input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" required className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" name="phone" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" name="password" required minLength={6} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" required className="input" defaultValue={activeTab === 'dispatchers' ? 'dispatcher' : activeTab === 'admins' ? 'admin' : 'driver'}>
                  <option value="driver">Driver</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {createUserMutation.isError && (
                <p className="text-red-600 text-sm">
                  Failed to create user. Please check the details and try again.
                </p>
              )}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-accent flex-1"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
