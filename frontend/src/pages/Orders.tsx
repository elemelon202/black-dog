import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../lib/api';
import { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  ChevronRight,
  Clock,
  MapPin,
  Truck
} from 'lucide-react';

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      const response = await ordersApi.getAll({
        status: statusFilter || undefined,
      });
      return response.data;
    },
  });

  const orders = data?.data || [];

  const filteredOrders = orders.filter((order: { attributes: { order_number: string; tracking_number: string } }) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      order.attributes.order_number.toLowerCase().includes(search) ||
      order.attributes.tracking_number.toLowerCase().includes(search)
    );
  });

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
      failed_delivery: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your shipments</p>
        </div>
        <Link to="/quote" className="btn btn-accent">
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order or tracking number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter
              ? 'Try adjusting your search or filters'
              : "You haven't placed any orders yet"}
          </p>
          <Link to="/quote" className="btn btn-accent">
            Create Your First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: {
            id: string;
            attributes: {
              order_number: string;
              tracking_number: string;
              status: string;
              pickup_date: string;
              estimated_delivery: string;
              pickup_contact_name: string;
              delivery_contact_name: string;
              total_amount: number;
              paid: boolean;
            }
          }) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-brand-900">
                      {order.attributes.order_number}
                    </h3>
                    {getStatusBadge(order.attributes.status)}
                    {order.attributes.paid ? (
                      <span className="text-xs text-green-600 font-medium">Paid</span>
                    ) : (
                      <span className="text-xs text-orange-600 font-medium">Unpaid</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {order.attributes.pickup_contact_name} →{' '}
                        {order.attributes.delivery_contact_name}
                      </span>
                    </div>

                    {order.attributes.pickup_date && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Pickup:{' '}
                          {new Date(order.attributes.pickup_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {order.attributes.status === 'in_transit' && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <Truck className="h-4 w-4" />
                        <span>In Transit</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-500">
                    Tracking: {order.attributes.tracking_number}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-brand-900">
                    £{Number(order.attributes.total_amount || 0).toFixed(2)}
                  </p>
                  {order.attributes.estimated_delivery && (
                    <p className="text-xs text-gray-500 mt-1">
                      ETA: {new Date(order.attributes.estimated_delivery).toLocaleDateString()}
                    </p>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-auto mt-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
