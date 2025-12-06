import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { driverApi } from '../../lib/api';
import {
  Truck,
  Clock,
  Package,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Navigation,
  User,
  Phone
} from 'lucide-react';

export default function DriverDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['driver', 'dashboard'],
    queryFn: async () => {
      const response = await driverApi.getDashboard();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card bg-red-50 border-red-200 text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const { driver, vehicle, current_job, upcoming_jobs, todays_checks } = data;
  const currentOrder = current_job?.data;
  const quote = current_job?.included?.find((inc: { type: string }) => inc.type === 'quote');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Driver Dashboard</h1>
        <p className="text-gray-600">Welcome back, {driver?.attributes?.first_name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <Truck className="h-8 w-8 text-accent-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-brand-900">{upcoming_jobs || 0}</p>
          <p className="text-sm text-gray-500">Active Jobs</p>
        </div>
        <div className="card text-center">
          <ClipboardList className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-brand-900">{todays_checks?.length || 0}</p>
          <p className="text-sm text-gray-500">Today's Checks</p>
        </div>
        <Link to="/driver/vehicle-check" className="card text-center hover:border-accent-500 transition-colors">
          <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-brand-900">Vehicle Check</p>
          <p className="text-xs text-gray-500">Start Check</p>
        </Link>
        <Link to="/driver/emergency" className="card text-center bg-red-50 border-red-200 hover:border-red-500 transition-colors">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-800">Emergency</p>
          <p className="text-xs text-red-600">Report Issue</p>
        </Link>
      </div>

      {/* Vehicle Info */}
      {vehicle && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-3 flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Your Vehicle
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-brand-900">{vehicle.attributes.name}</p>
              <p className="text-sm text-gray-500">{vehicle.attributes.registration_number}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              vehicle.attributes.available
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {vehicle.attributes.available ? 'Available' : 'On Job'}
            </span>
          </div>
        </div>
      )}

      {/* Current Job */}
      {currentOrder ? (
        <div className="card border-accent-500 border-2 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-900 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Current Job
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
              currentOrder.attributes.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
              currentOrder.attributes.status === 'assigned' ? 'bg-indigo-100 text-indigo-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentOrder.attributes.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="space-y-4">
            {/* Order Number */}
            <div className="text-sm text-gray-500">
              Order: <span className="font-medium text-brand-900">{currentOrder.attributes.order_number}</span>
            </div>

            {/* Pickup */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center text-green-700 font-medium mb-2">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold mr-2">A</div>
                Pickup
              </div>
              <p className="text-gray-800 font-medium">
                {[quote?.attributes.pickup_company_name, quote?.attributes.pickup_city, quote?.attributes.pickup_postcode].filter(Boolean).join(', ')}
              </p>
              {currentOrder.attributes.pickup_contact_name && (
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {currentOrder.attributes.pickup_contact_name}
                  </span>
                  {currentOrder.attributes.pickup_contact_phone && (
                    <a href={`tel:${currentOrder.attributes.pickup_contact_phone}`} className="flex items-center text-accent-600">
                      <Phone className="h-4 w-4 mr-1" />
                      {currentOrder.attributes.pickup_contact_phone}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center text-blue-700 font-medium mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-2">B</div>
                Delivery
              </div>
              <p className="text-gray-800 font-medium">
                {[quote?.attributes.delivery_company_name, quote?.attributes.delivery_city, quote?.attributes.delivery_postcode].filter(Boolean).join(', ')}
              </p>
              {currentOrder.attributes.delivery_contact_name && (
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {currentOrder.attributes.delivery_contact_name}
                  </span>
                  {currentOrder.attributes.delivery_contact_phone && (
                    <a href={`tel:${currentOrder.attributes.delivery_contact_phone}`} className="flex items-center text-accent-600">
                      <Phone className="h-4 w-4 mr-1" />
                      {currentOrder.attributes.delivery_contact_phone}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Cargo Info */}
            {quote && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  {quote.attributes.cargo_weight_kg}kg
                </span>
                {quote.attributes.cargo_description && (
                  <span className="truncate">{quote.attributes.cargo_description}</span>
                )}
              </div>
            )}

            {/* Timing */}
            {currentOrder.attributes.estimated_arrival_time && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                ETA: {new Date(currentOrder.attributes.estimated_arrival_time).toLocaleString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Link
                to={`/driver/run-sheet/${currentOrder.id}`}
                className="btn btn-accent flex-1"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                View Run Sheet
              </Link>
              <Link
                to={`/driver/job/${currentOrder.id}`}
                className="btn btn-secondary flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Navigate
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 mb-6">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Active Jobs</h2>
          <p className="text-gray-500">You'll see your next job here when assigned</p>
        </div>
      )}

      {/* No Vehicle Warning */}
      {!vehicle && (
        <div className="card bg-yellow-50 border-yellow-200 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">No Vehicle Assigned</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Contact dispatch to have a vehicle assigned to you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Vehicle Checks */}
      {todays_checks && todays_checks.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-brand-900 mb-3 flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Today's Vehicle Checks
          </h2>
          <div className="space-y-2">
            {todays_checks.map((check: { id: string; attributes: { check_type: string; all_passed: boolean; created_at: string } }) => (
              <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium capitalize">{check.attributes.check_type.replace(/_/g, ' ')}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(check.attributes.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  check.attributes.all_passed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {check.attributes.all_passed ? 'Passed' : 'Issues Found'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
