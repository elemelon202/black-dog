import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import {
  Users,
  Phone,
  Mail,
  Building,
  Calendar
} from 'lucide-react';

export default function AdminCustomers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: async () => {
      const response = await adminApi.getCustomers();
      return response.data;
    },
  });

  const customers = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-900">Customers</h1>
        <p className="text-gray-600">View all registered customers</p>
      </div>

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">No customers yet</h3>
          <p className="text-gray-500">Customers will appear here once they register</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Registered</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer: {
                  id: string;
                  attributes: {
                    email: string;
                    first_name: string;
                    last_name: string;
                    phone: string;
                    full_name: string;
                    company_name: string;
                    created_at: string;
                  };
                }) => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-brand-700 font-medium">
                            {customer.attributes.first_name?.[0]}{customer.attributes.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-brand-900">{customer.attributes.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="flex items-center text-gray-600">
                          <Mail className="h-3 w-3 mr-2" />
                          {customer.attributes.email}
                        </p>
                        <p className="flex items-center text-gray-600 mt-1">
                          <Phone className="h-3 w-3 mr-2" />
                          {customer.attributes.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {customer.attributes.company_name ? (
                        <span className="flex items-center text-gray-600 text-sm">
                          <Building className="h-4 w-4 mr-2" />
                          {customer.attributes.company_name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(customer.attributes.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/admin/orders?user_id=${customer.id}`}
                        className="text-accent-600 hover:text-accent-700 text-sm font-medium"
                      >
                        View Orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
