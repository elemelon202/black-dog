import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi, vehiclesApi } from '../../lib/api';
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  Clock,
  Phone,
  Mail,
  User,
  CheckCircle,
  X,
  Route,
  Navigation
} from 'lucide-react';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const response = await adminApi.getOrder(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await vehiclesApi.getAll({ available: true });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateOrderStatus(Number(id), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      setShowStatusModal(false);
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: (vehicleId: number) => adminApi.assignDriver(Number(id), vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      setShowAssignModal(false);
    },
  });

  const vehicles = vehiclesData?.data || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">Order not found</h3>
          <Link to="/admin/orders" className="btn btn-accent">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = data.data?.attributes || data.attributes || data;
  // Quote can be in included array or nested in order
  const quoteFromIncluded = data.included?.find((i: { type: string }) => i.type === 'quote')?.attributes;
  const quote = quoteFromIncluded || order.quote?.data?.attributes || order.quote?.attributes || order.quote || {};
  const user = data.included?.find((i: { type: string }) => i.type === 'user')?.attributes || {};

  // Check if this is a multi-drop or backload order
  const isMultiDrop = order.special_instructions?.includes('Multi-drop');
  const isBackload = order.special_instructions?.includes('BACKLOAD') || quote.cargo_description?.includes('BACKLOAD');

  // Get multi-drop related stops
  const multiDropStops = data.multi_drop_stops || [];
  const currentStopNumber = order.special_instructions?.match(/Stop (\d+)/)?.[1];
  const totalStops = order.special_instructions?.match(/of (\d+)/)?.[1];

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace(/_/g, ' ') || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-brand-900">{order.order_number}</h1>
              <button onClick={() => setShowStatusModal(true)}>
                {getStatusBadge(order.status)}
              </button>
            </div>
            <p className="text-gray-500 mt-1">
              Tracking: {order.tracking_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-brand-900">
              £{Number(order.total_amount || quote.total_price || 0).toFixed(2)}
            </p>
            {order.paid ? (
              <span className="text-sm text-green-600 font-medium">Paid</span>
            ) : (
              <span className="text-sm text-orange-600 font-medium">Unpaid</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-900 flex items-center mb-4">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pickup Contact</p>
                <p className="font-medium text-brand-900">{order.pickup_contact_name}</p>
                <p className="text-gray-600 flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${order.pickup_contact_phone}`} className="hover:text-accent-600">
                    {order.pickup_contact_phone}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery Contact</p>
                <p className="font-medium text-brand-900">{order.delivery_contact_name}</p>
                <p className="text-gray-600 flex items-center mt-1">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${order.delivery_contact_phone}`} className="hover:text-accent-600">
                    {order.delivery_contact_phone}
                  </a>
                </p>
              </div>
            </div>
            {user.email && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Account Email</p>
                <p className="text-gray-600 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${user.email}`} className="hover:text-accent-600">
                    {user.email}
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Route Details */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Route Details
              </h2>
              <div className="flex gap-2">
                {isBackload && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    Backload
                  </span>
                )}
                {isMultiDrop && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Stop {currentStopNumber} of {totalStops}
                  </span>
                )}
              </div>
            </div>

            {/* Multi-drop run info */}
            {isMultiDrop && multiDropStops.length > 0 && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm font-medium text-purple-800 mb-2">
                  Multi-drop Run from {quote.pickup_city}
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Combine current order with other stops and sort by stop number */}
                  {[
                    { id: Number(id), delivery_city: quote.delivery_city, stop_number: currentStopNumber, isCurrent: true },
                    ...multiDropStops.map((s: { id: number; delivery_city: string; stop_number: string }) => ({ ...s, isCurrent: false }))
                  ]
                    .sort((a, b) => Number(a.stop_number) - Number(b.stop_number))
                    .map((stop: { id: number; delivery_city: string; stop_number: string; isCurrent: boolean }) => (
                      stop.isCurrent ? (
                        <span
                          key={stop.id}
                          className="px-2 py-1 rounded text-xs font-medium bg-purple-600 text-white"
                        >
                          {stop.stop_number}. {stop.delivery_city}
                        </span>
                      ) : (
                        <Link
                          key={stop.id}
                          to={`/admin/orders/${stop.id}`}
                          className="px-2 py-1 rounded text-xs font-medium hover:opacity-80 bg-white text-purple-700 border border-purple-200"
                        >
                          {stop.stop_number}. {stop.delivery_city}
                        </Link>
                      )
                    ))}
                </div>
              </div>
            )}

            {/* Distance and duration summary */}
            {(quote.distance_km || quote.estimated_duration_hours) && (
              <div className="flex gap-4 mb-4 text-sm">
                {quote.distance_km && (
                  <span className="text-gray-600">
                    <strong>{Number(quote.distance_km).toFixed(0)}</strong> km
                  </span>
                )}
                {quote.estimated_duration_hours && (
                  <span className="text-gray-600">
                    <strong>{Number(quote.estimated_duration_hours).toFixed(1)}</strong> hours
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-600 font-medium mb-2">Pickup</p>
                {quote.pickup_company_name && (
                  <p className="font-semibold text-brand-900">{quote.pickup_company_name}</p>
                )}
                {quote.pickup_address_line1 && (
                  <p className="text-gray-700">{quote.pickup_address_line1}</p>
                )}
                {quote.pickup_address_line2 && (
                  <p className="text-gray-600">{quote.pickup_address_line2}</p>
                )}
                <p className="text-gray-700">
                  {quote.pickup_city && <span>{quote.pickup_city}, </span>}
                  {quote.pickup_state && <span>{quote.pickup_state} </span>}
                  <span className="font-medium">{quote.pickup_postcode || 'N/A'}</span>
                </p>
                <p className="text-gray-500 text-sm">{quote.pickup_country || 'GB'}</p>
                {order.pickup_date && (
                  <p className="mt-3 text-sm text-green-600 flex items-center font-medium">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(order.pickup_date).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                )}
                {order.actual_pickup_date && (
                  <p className="mt-1 text-xs text-green-700">
                    Collected: {new Date(order.actual_pickup_date).toLocaleString('en-GB')}
                  </p>
                )}
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-sm text-red-600 font-medium mb-2">Delivery</p>
                {quote.delivery_company_name && (
                  <p className="font-semibold text-brand-900">{quote.delivery_company_name}</p>
                )}
                {quote.delivery_address_line1 && (
                  <p className="text-gray-700">{quote.delivery_address_line1}</p>
                )}
                {quote.delivery_address_line2 && (
                  <p className="text-gray-600">{quote.delivery_address_line2}</p>
                )}
                <p className="text-gray-700">
                  {quote.delivery_city && <span>{quote.delivery_city}, </span>}
                  {quote.delivery_state && <span>{quote.delivery_state} </span>}
                  <span className="font-medium">{quote.delivery_postcode || 'N/A'}</span>
                </p>
                <p className="text-gray-500 text-sm">{quote.delivery_country || 'GB'}</p>
                {order.delivery_date && (
                  <p className="mt-3 text-sm text-red-600 flex items-center font-medium">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(order.delivery_date).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                )}
                {order.actual_delivery_date && (
                  <p className="mt-1 text-xs text-green-700">
                    Delivered: {new Date(order.actual_delivery_date).toLocaleString('en-GB')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cargo Details */}
          {quote.cargo_weight_kg && (
            <div className="card">
              <h2 className="text-lg font-semibold text-brand-900 flex items-center mb-4">
                <Package className="h-5 w-5 mr-2" />
                Cargo Details
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Weight</p>
                  <p className="font-medium text-brand-900">{quote.cargo_weight_kg} kg</p>
                </div>
                {quote.cargo_volume_cbm && Number(quote.cargo_volume_cbm) > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Volume</p>
                    <p className="font-medium text-brand-900">{quote.cargo_volume_cbm} m³</p>
                  </div>
                )}
                {quote.vehicle_type_required && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vehicle Type</p>
                    <p className="font-medium text-brand-900 capitalize">
                      {quote.vehicle_type_required.replace(/_/g, ' ')}
                    </p>
                  </div>
                )}
              </div>
              {quote.cargo_description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-brand-900">{quote.cargo_description}</p>
                </div>
              )}
            </div>
          )}

          {/* Special Instructions */}
          {order.special_instructions && (
            <div className="card">
              <h2 className="text-lg font-semibold text-brand-900 mb-4">Special Instructions</h2>
              <p className="text-gray-700">{order.special_instructions}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="font-semibold text-brand-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => setShowStatusModal(true)}
                className="btn btn-secondary w-full"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="btn btn-secondary w-full"
              >
                <Truck className="h-4 w-4 mr-2" />
                Assign Driver
              </button>
              <Link
                to={`/admin/orders/${id}/route`}
                className="btn btn-accent w-full flex items-center justify-center"
              >
                <Route className="h-4 w-4 mr-2" />
                Route Planner
              </Link>
            </div>
          </div>

          {/* Route Instructions (if set) */}
          {(order.route_instructions || order.pickup_instructions || order.delivery_instructions) && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-brand-900">Driver Instructions</h2>
                <Link
                  to={`/admin/orders/${id}/route`}
                  className="text-accent-600 hover:text-accent-700 text-sm"
                >
                  Edit
                </Link>
              </div>
              <div className="space-y-3 text-sm">
                {order.route_instructions && (
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center">
                      <Navigation className="h-3 w-3 mr-1" /> Route
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">{order.route_instructions}</p>
                  </div>
                )}
                {order.pickup_instructions && (
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" /> Pickup
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">{order.pickup_instructions}</p>
                  </div>
                )}
                {order.delivery_instructions && (
                  <div>
                    <p className="text-gray-500 mb-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" /> Delivery
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">{order.delivery_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status History (placeholder) */}
          <div className="card">
            <h2 className="font-semibold text-brand-900 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-brand-900">Order Created</p>
                  <p className="text-xs text-gray-500">
                    {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-brand-900 capitalize">
                    {order.status?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">Current Status</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Breakdown */}
          <div className="card">
            <h2 className="font-semibold text-brand-900 mb-4">Quote Breakdown</h2>
            <div className="space-y-2 text-sm">
              {quote.base_price && Number(quote.base_price) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span>£{Number(quote.base_price).toFixed(2)}</span>
                </div>
              )}
              {quote.distance_charge && Number(quote.distance_charge) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance ({quote.distance_km ? `${Number(quote.distance_km).toFixed(0)} km` : 'N/A'})</span>
                  <span>£{Number(quote.distance_charge).toFixed(2)}</span>
                </div>
              )}
              {quote.fuel_surcharge && Number(quote.fuel_surcharge) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Surcharge</span>
                  <span>£{Number(quote.fuel_surcharge).toFixed(2)}</span>
                </div>
              )}
              {quote.additional_services_charge && Number(quote.additional_services_charge) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Services</span>
                  <span>£{Number(quote.additional_services_charge).toFixed(2)}</span>
                </div>
              )}

              {/* Subtotal before VAT */}
              {(quote.base_price || quote.distance_charge || quote.fuel_surcharge || quote.additional_services_charge) && (
                <div className="flex justify-between pt-2 border-t border-dashed">
                  <span className="text-gray-600">Subtotal (ex. VAT)</span>
                  <span>£{(
                    Number(quote.base_price || 0) +
                    Number(quote.distance_charge || 0) +
                    Number(quote.fuel_surcharge || 0) +
                    Number(quote.additional_services_charge || 0)
                  ).toFixed(2)}</span>
                </div>
              )}

              {quote.vat_amount && Number(quote.vat_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (20%)</span>
                  <span>£{Number(quote.vat_amount).toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-brand-900">£{Number(order.total_amount || quote.total_price || 0).toFixed(2)}</span>
              </div>

              {/* Payment status */}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Payment Status</span>
                {order.paid ? (
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Paid
                  </span>
                ) : (
                  <span className="text-orange-600 font-medium">Unpaid</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-brand-900">Update Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {allStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatusMutation.mutate(status)}
                    disabled={updateStatusMutation.isPending}
                    className={`p-3 text-left rounded-lg border transition-colors capitalize ${
                      order.status === status
                        ? 'border-accent-500 bg-accent-50'
                        : 'hover:border-accent-500 hover:bg-accent-50'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                    {order.status === status && (
                      <CheckCircle className="h-4 w-4 inline ml-2 text-accent-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-brand-900">Assign Driver/Vehicle</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {vehicles.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No available vehicles</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {vehicles.map((vehicle: { id: string; attributes: { name: string; registration_number: string; vehicle_type: string } }) => (
                    <button
                      key={vehicle.id}
                      onClick={() => assignDriverMutation.mutate(Number(vehicle.id))}
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
