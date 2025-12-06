import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, vehiclesApi } from '../../lib/api';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Truck,
  X,
  Edit2,
  Trash2
} from 'lucide-react';

interface DriverFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export default function AdminDrivers() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<string | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { data: driversData, isLoading } = useQuery({
    queryKey: ['admin', 'drivers'],
    queryFn: async () => {
      const response = await adminApi.getDrivers();
      return response.data;
    },
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await vehiclesApi.getAll();
      return response.data;
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: (data: DriverFormData) =>
      adminApi.createUser({ ...data, role: 'driver' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: { response?: { data?: { errors?: string[] } } }) => {
      setFormError(error.response?.data?.errors?.[0] || 'Failed to create driver');
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DriverFormData> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
      setEditingDriver(null);
      resetForm();
    },
    onError: (error: { response?: { data?: { errors?: string[] } } }) => {
      setFormError(error.response?.data?.errors?.[0] || 'Failed to update driver');
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });

  const drivers = driversData?.data || [];
  const vehicles = vehiclesData?.data || [];

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
    });
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingDriver) {
      const { password, ...updateData } = formData;
      updateDriverMutation.mutate({ id: Number(editingDriver), data: updateData });
    } else {
      createDriverMutation.mutate(formData);
    }
  };

  const handleEdit = (driver: { id: string; attributes: { email: string; first_name: string; last_name: string; phone: string } }) => {
    setFormData({
      email: driver.attributes.email,
      password: '',
      first_name: driver.attributes.first_name,
      last_name: driver.attributes.last_name,
      phone: driver.attributes.phone,
    });
    setEditingDriver(driver.id);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      deleteDriverMutation.mutate(Number(id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Driver Management</h1>
          <p className="text-gray-600">Add, edit, and manage drivers</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingDriver(null);
            setShowAddModal(true);
          }}
          className="btn btn-accent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </button>
      </div>

      {/* Drivers Grid */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading drivers...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">No drivers yet</h3>
          <p className="text-gray-500 mb-4">Add your first driver to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-accent"
          >
            Add Driver
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver: {
            id: string;
            attributes: {
              email: string;
              first_name: string;
              last_name: string;
              phone: string;
              full_name: string;
            };
          }) => (
            <div key={driver.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-700 font-semibold text-lg">
                      {driver.attributes.first_name?.[0]}{driver.attributes.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-900">{driver.attributes.full_name}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Driver</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {driver.attributes.email}
                </p>
                <p className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {driver.attributes.phone}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicles Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-brand-900 mb-6">Vehicles</h2>
        {vehicles.length === 0 ? (
          <div className="card text-center py-8">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No vehicles registered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle: {
              id: string;
              attributes: {
                name: string;
                registration_number: string;
                vehicle_type: string;
                max_weight_kg: number;
                available: boolean;
              };
            }) => (
              <div key={vehicle.id} className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-full ${vehicle.attributes.available ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Truck className={`h-5 w-5 ${vehicle.attributes.available ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-brand-900">{vehicle.attributes.name}</h4>
                    <p className="text-sm text-gray-500">{vehicle.attributes.registration_number}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{vehicle.attributes.vehicle_type?.replace(/_/g, ' ')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${vehicle.attributes.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {vehicle.attributes.available ? 'Available' : 'In Use'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-brand-900">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {!editingDriver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required={!editingDriver}
                    minLength={6}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createDriverMutation.isPending || updateDriverMutation.isPending}
                  className="btn btn-accent"
                >
                  {createDriverMutation.isPending || updateDriverMutation.isPending
                    ? 'Saving...'
                    : editingDriver
                    ? 'Update Driver'
                    : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
