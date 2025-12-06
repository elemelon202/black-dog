import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import {
  Package,
  Truck,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Receipt
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['admin', 'order-stats'],
    queryFn: async () => {
      const response = await adminApi.getOrderStats();
      return response.data;
    },
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: async () => {
      const response = await adminApi.getOrders({ per_page: 10 });
      return response.data;
    },
  });

  const stats = statsData || {};
  const recentOrders = recentOrdersData?.data || [];

  const statCards = [
    { name: 'Pending', value: stats.pending || 0, icon: Clock, color: 'bg-yellow-100 text-yellow-600', link: '/admin/orders?status=pending' },
    { name: 'Assigned', value: stats.assigned || 0, icon: Users, color: 'bg-indigo-100 text-indigo-600', link: '/admin/orders?status=assigned' },
    { name: 'In Transit', value: stats.in_transit || 0, icon: Truck, color: 'bg-blue-100 text-blue-600', link: '/admin/orders?status=in_transit' },
    { name: 'Delivered Today', value: stats.delivered_today || 0, icon: CheckCircle, color: 'bg-green-100 text-green-600', link: '/admin/orders?status=delivered' },
    { name: 'On Hold', value: stats.on_hold || 0, icon: AlertTriangle, color: 'bg-orange-100 text-orange-600', link: '/admin/orders?status=on_hold' },
    { name: 'Unpaid', value: stats.unpaid || 0, icon: DollarSign, color: 'bg-red-100 text-red-600', link: '/admin/orders?paid=false' },
  ];

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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of all orders and operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="card hover:shadow-md transition-shadow"
            >
              <div className={`p-2 rounded-full ${stat.color} w-fit mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-brand-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.name}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Link to="/admin/orders" className="card hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5 text-brand-600" />
            <span className="font-medium">All Orders</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link to="/admin/drivers" className="card hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-brand-600" />
            <span className="font-medium">Manage Drivers</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link to="/admin/customers" className="card hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-brand-600" />
            <span className="font-medium">Customers</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link to="/admin/finances" className="card hover:shadow-md transition-shadow flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Receipt className="h-5 w-5 text-brand-600" />
            <span className="font-medium">Finances</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
        <Link to="/quote" className="card hover:shadow-md transition-shadow flex items-center justify-between bg-accent-50 border-accent-200">
          <div className="flex items-center space-x-3">
            <span className="font-medium text-accent-700">Create Quote</span>
          </div>
          <ArrowRight className="h-4 w-4 text-accent-500" />
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-brand-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-accent-600 hover:text-accent-700 text-sm font-medium">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Order</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Paid</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Date</th>
                <th className="text-right py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: {
                id: string;
                attributes: {
                  order_number: string;
                  status: string;
                  total_amount: number;
                  paid: boolean;
                  created_at: string;
                  pickup_contact_name: string;
                  delivery_contact_name: string;
                };
              }) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <span className="font-medium text-brand-900">{order.attributes.order_number}</span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {order.attributes.pickup_contact_name}
                  </td>
                  <td className="py-3 px-2">
                    {getStatusBadge(order.attributes.status)}
                  </td>
                  <td className="py-3 px-2 font-medium">
                    £{Number(order.attributes.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2">
                    {order.attributes.paid ? (
                      <span className="text-green-600 text-sm">Paid</span>
                    ) : (
                      <span className="text-orange-600 text-sm">Unpaid</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-500">
                    {new Date(order.attributes.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
