import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi, vehiclesApi } from '../../lib/api';
import {
  Package,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Truck,
  X,
  ChevronDown
} from 'lucide-react';

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const statusFilter = searchParams.get('status') || '';
  const paidFilter = searchParams.get('paid') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter, paidFilter, currentPage],
    queryFn: async () => {
      const response = await adminApi.getOrders({
        status: statusFilter || undefined,
        paid: paidFilter || undefined,
        page: currentPage,
        per_page: perPage,
      });
      return response.data;
    },
  });

  const meta = data?.meta || {};
  const totalPages = meta.total_pages || 1;
  const totalCount = meta.total_count || 0;

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await vehiclesApi.getAll({ available: true });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order-stats'] });
      setShowStatusModal(false);
      setSelectedOrder(null);
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ orderId, vehicleId }: { orderId: number; vehicleId: number }) =>
      adminApi.assignDriver(orderId, vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setShowAssignModal(false);
      setSelectedOrder(null);
    },
  });

  const orders = data?.data || [];
  const vehicles = vehiclesData?.data || [];

  const filteredOrders = orders.filter((order: { attributes: { order_number: string; tracking_number: string; pickup_contact_name: string; delivery_contact_name: string } }) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      order.attributes.order_number?.toLowerCase().includes(search) ||
      order.attributes.tracking_number?.toLowerCase().includes(search) ||
      order.attributes.pickup_contact_name?.toLowerCase().includes(search) ||
      order.attributes.delivery_contact_name?.toLowerCase().includes(search)
    );
  });

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const allStatuses = ['pending', 'confirmed', 'assigned', 'in_transit', 'out_for_delivery', 'delivered', 'on_hold', 'cancelled'];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      assigned: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-green-100 text-green-800',
      out_for_delivery: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      on_hold: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace(/_/g, ' ') || 'Unknown'}
      </span>
    );
  };

  const getSelectedOrderData = () => {
    return orders.find((o: { id: string }) => o.id === selectedOrder);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Orders Management</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, tracking numbers, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set('status', e.target.value);
                } else {
                  newParams.delete('status');
                }
                newParams.delete('page'); // Reset to page 1 when filter changes
                setSearchParams(newParams);
              }}
              className="input w-auto"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={paidFilter}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set('paid', e.target.value);
                } else {
                  newParams.delete('paid');
                }
                newParams.delete('page'); // Reset to page 1 when filter changes
                setSearchParams(newParams);
              }}
              className="input w-auto"
            >
              <option value="">All Payment</option>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">No orders found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dates</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Driver</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: {
                  id: string;
                  attributes: {
                    order_number: string;
                    tracking_number: string;
                    status: string;
                    total_amount: number;
                    paid: boolean;
                    created_at: string;
                    pickup_date: string;
                    delivery_date: string;
                    actual_pickup_date: string;
                    actual_delivery_date: string;
                    pickup_contact_name: string;
                    pickup_contact_phone: string;
                    delivery_contact_name: string;
                    delivery_contact_phone: string;
                    is_backload?: boolean;
                    is_multi_drop?: boolean;
                  };
                  relationships?: {
                    vehicle?: {
                      data?: {
                        id: string;
                      };
                    };
                  };
                }) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-brand-900">{order.attributes.order_number}</span>
                          {order.attributes.is_backload && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                              Backload
                            </span>
                          )}
                          {order.attributes.is_multi_drop && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              Multi-drop
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{order.attributes.tracking_number}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{order.attributes.pickup_contact_name}</p>
                        <p className="text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.attributes.pickup_contact_phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        <p className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-green-500" />
                          {order.attributes.pickup_contact_name}
                        </p>
                        <p className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-red-500" />
                          {order.attributes.delivery_contact_name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="text-gray-600">
                          <span className="text-xs text-gray-400">Pickup:</span>{' '}
                          {order.attributes.pickup_date
                            ? new Date(order.attributes.pickup_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : '-'}
                        </p>
                        <p className="text-gray-600">
                          <span className="text-xs text-gray-400">Delivery:</span>{' '}
                          {order.attributes.delivery_date
                            ? new Date(order.attributes.delivery_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : '-'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order.id);
                          setShowStatusModal(true);
                        }}
                        className="hover:opacity-80"
                      >
                        {getStatusBadge(order.attributes.status)}
                        <ChevronDown className="h-3 w-3 inline ml-1" />
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-medium">£{Number(order.attributes.total_amount || 0).toFixed(2)}</span>
                        {order.attributes.paid ? (
                          <span className="block text-xs text-green-600">Paid</span>
                        ) : (
                          <span className="block text-xs text-orange-600">Unpaid</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {order.relationships?.vehicle?.data ? (
                        <span className="text-sm text-gray-600 flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          Assigned
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrder(order.id);
                            setShowAssignModal(true);
                          }}
                          className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                        >
                          Assign Driver
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalCount)} of {totalCount} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', String(currentPage - 1));
                    setSearchParams(newParams);
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', String(pageNum));
                          setSearchParams(newParams);
                        }}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === pageNum
                            ? 'bg-brand-900 text-white border-brand-900'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', String(currentPage + 1));
                    setSearchParams(newParams);
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-brand-900">Update Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Order: {getSelectedOrderData()?.attributes.order_number}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {allStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatusMutation.mutate({ orderId: Number(selectedOrder), status })}
                    disabled={updateStatusMutation.isPending}
                    className="p-3 text-left rounded-lg border hover:border-accent-500 hover:bg-accent-50 transition-colors capitalize"
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-brand-900">Assign Driver/Vehicle</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Order: {getSelectedOrderData()?.attributes.order_number}
              </p>
              {vehicles.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No available vehicles</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {vehicles.map((vehicle: { id: string; attributes: { name: string; registration_number: string; vehicle_type: string } }) => (
                    <button
                      key={vehicle.id}
                      onClick={() => assignDriverMutation.mutate({ orderId: Number(selectedOrder), vehicleId: Number(vehicle.id) })}
                      disabled={assignDriverMutation.isPending}
                      className="w-full p-3 text-left rounded-lg border hover:border-accent-500 hover:bg-accent-50 transition-colors"
                    >
                      <p className="font-medium">{vehicle.attributes.name}</p>
                      <p className="text-sm text-gray-500">
                        {vehicle.attributes.registration_number} - {vehicle.attributes.vehicle_type?.replace(/_/g, ' ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
