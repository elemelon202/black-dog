import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quotesApi, ordersApi } from '../lib/api';
import {
  FileText,
  Package,
  Truck,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: quotesData } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const response = await quotesApi.getAll({ per_page: 5 });
      return response.data;
    },
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.getAll({ per_page: 5 });
      return response.data;
    },
  });

  const quotes = quotesData?.data || [];
  const orders = ordersData?.data || [];

  const stats = [
    {
      name: 'Active Quotes',
      value: quotes.filter((q: { attributes: { status: string } }) =>
        ['pending', 'sent'].includes(q.attributes.status)
      ).length,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Active Orders',
      value: orders.filter((o: { attributes: { status: string } }) =>
        ['pending', 'confirmed', 'in_transit'].includes(o.attributes.status)
      ).length,
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      name: 'In Transit',
      value: orders.filter((o: { attributes: { status: string } }) => o.attributes.status === 'in_transit').length,
      icon: Truck,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Delivered',
      value: orders.filter((o: { attributes: { status: string } }) => o.attributes.status === 'delivered').length,
      icon: CheckCircle,
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your shipping activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-brand-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/quote"
          className="card hover:shadow-md transition-shadow flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-brand-900">Get a Quote</h3>
            <p className="text-sm text-gray-500">Request a new shipping quote</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-accent-500 transition-colors" />
        </Link>
        <Link
          to="/track"
          className="card hover:shadow-md transition-shadow flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-brand-900">Track Shipment</h3>
            <p className="text-sm text-gray-500">Check delivery status</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-accent-500 transition-colors" />
        </Link>
        <Link
          to="/orders"
          className="card hover:shadow-md transition-shadow flex items-center justify-between group"
        >
          <div>
            <h3 className="font-semibold text-brand-900">View Orders</h3>
            <p className="text-sm text-gray-500">Manage your shipments</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-accent-500 transition-colors" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Quotes */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-brand-900">Recent Quotes</h2>
            <Link to="/quotes" className="text-accent-600 hover:text-accent-700 text-sm font-medium">
              View all
            </Link>
          </div>

          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No quotes yet</p>
              <Link to="/quote" className="text-accent-600 hover:text-accent-700 text-sm font-medium">
                Get your first quote →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.slice(0, 5).map((quote: { id: string; attributes: { quote_number: string; status: string; pickup_postcode: string; delivery_postcode: string; total_price: number } }) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-brand-900">{quote.attributes.quote_number}</p>
                    <p className="text-sm text-gray-500">
                      {quote.attributes.pickup_postcode} → {quote.attributes.delivery_postcode}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(quote.attributes.status)}
                    <p className="text-sm font-medium text-brand-900 mt-1">
                      £{Number(quote.attributes.total_price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-brand-900">Recent Orders</h2>
            <Link to="/orders" className="text-accent-600 hover:text-accent-700 text-sm font-medium">
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <Link to="/quote" className="text-accent-600 hover:text-accent-700 text-sm font-medium">
                Create an order from a quote →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order: { id: string; attributes: { order_number: string; status: string; tracking_number: string; estimated_delivery: string } }) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-brand-900">{order.attributes.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {order.attributes.tracking_number}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.attributes.status)}
                    {order.attributes.estimated_delivery && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(order.attributes.estimated_delivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 card bg-brand-50 border-brand-100">
        <div className="flex items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-brand-900">Need Assistance?</h3>
            <p className="text-brand-700 text-sm mt-1">
              Our team is available Monday to Friday, 8am-6pm.
              Call us on <span className="font-medium">0800 XXX XXXX</span> or email{' '}
              <a href="mailto:support@blackdogexpress.co.uk" className="font-medium hover:underline">
                support@blackdogexpress.co.uk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
