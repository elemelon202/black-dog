import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ordersApi } from '../lib/api';
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await ordersApi.getOne(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
  };

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
          <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/orders" className="btn btn-accent">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const order = data.data?.attributes || data.attributes || data;
  const quote = order.quote?.data?.attributes || order.quote?.attributes || order.quote || {};

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace(/_/g, ' ') || 'Unknown'}
      </span>
    );
  };

  const getStatusTimeline = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'assigned', label: 'Driver Assigned' },
      { key: 'in_transit', label: 'In Transit' },
      { key: 'delivered', label: 'Delivered' },
    ];

    const statusOrder = ['pending', 'confirmed', 'assigned', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return (
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepIndex = statusOrder.indexOf(step.key);
          const isComplete = currentIndex >= stepIndex;
          const isCurrent = status === step.key || (status === 'out_for_delivery' && step.key === 'in_transit');

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}>
                {isComplete ? <CheckCircle className="h-5 w-5" /> : index + 1}
              </div>
              <span className={`text-xs mt-2 text-center ${isComplete ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`absolute h-0.5 w-full ${isComplete ? 'bg-green-500' : 'bg-gray-200'}`} style={{ left: '50%', top: '16px' }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-brand-900">{order.order_number}</h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-gray-500 mt-1">
              Created {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-brand-900">
              £{Number(order.total_amount || quote.total_price || 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">inc. VAT</p>
            {order.paid ? (
              <span className="text-sm text-green-600 font-medium">Paid</span>
            ) : (
              <span className="text-sm text-orange-600 font-medium">Payment Pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Card */}
      <div className="card mb-6 bg-brand-50 border-brand-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brand-600 font-medium">Tracking Number</p>
            <p className="text-xl font-bold text-brand-900">{order.tracking_number}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => copyTrackingNumber(order.tracking_number)}
              className="btn btn-secondary text-sm"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </button>
            <Link to={`/track?number=${order.tracking_number}`} className="btn btn-accent text-sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              Track
            </Link>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-6">Order Progress</h2>
          {getStatusTimeline(order.status)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-900 flex items-center mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              Shipment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Collection</p>
                <p className="font-medium text-brand-900">{quote.pickup_postcode || 'N/A'}</p>
                <p className="text-gray-600">{quote.pickup_country || ''}</p>
                {order.pickup_contact_name && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">{order.pickup_contact_name}</p>
                    <p className="text-gray-500">{order.pickup_contact_phone}</p>
                  </div>
                )}
                {order.pickup_date && (
                  <p className="mt-2 text-sm text-brand-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date(order.pickup_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Delivery</p>
                <p className="font-medium text-brand-900">{quote.delivery_postcode || 'N/A'}</p>
                <p className="text-gray-600">{quote.delivery_country || ''}</p>
                {order.delivery_contact_name && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">{order.delivery_contact_name}</p>
                    <p className="text-gray-500">{order.delivery_contact_phone}</p>
                  </div>
                )}
                {order.estimated_delivery && (
                  <p className="mt-2 text-sm text-brand-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    ETA: {new Date(order.estimated_delivery).toLocaleDateString()}
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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              {quote.cargo_description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-brand-900">{quote.cargo_description}</p>
                </div>
              )}
            </div>
          )}

          {/* Vehicle */}
          {quote.vehicle_type_required && (
            <div className="card">
              <h2 className="text-lg font-semibold text-brand-900 flex items-center mb-4">
                <Truck className="h-5 w-5 mr-2" />
                Vehicle
              </h2>
              <p className="font-medium text-brand-900 capitalize">
                {quote.vehicle_type_required.replace(/_/g, ' ')}
              </p>
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
          {/* Price Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-900 mb-4">Price Summary</h2>
            <div className="space-y-3">
              {quote.base_price && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span>£{Number(quote.base_price).toFixed(2)}</span>
                </div>
              )}
              {quote.distance_charge && Number(quote.distance_charge) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance Charge</span>
                  <span>£{Number(quote.distance_charge).toFixed(2)}</span>
                </div>
              )}
              {quote.additional_services_charge && Number(quote.additional_services_charge) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Additional Services</span>
                  <span>£{Number(quote.additional_services_charge).toFixed(2)}</span>
                </div>
              )}
              {quote.vat_amount && (
                <>
                  <div className="border-t pt-3 flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>£{(Number(quote.total_price) - Number(quote.vat_amount)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (20%)</span>
                    <span>£{Number(quote.vat_amount).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>£{Number(order.total_amount || quote.total_price || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className={`card ${order.paid ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
            <h2 className={`font-semibold mb-2 ${order.paid ? 'text-green-900' : 'text-orange-900'}`}>
              {order.paid ? 'Payment Complete' : 'Payment Required'}
            </h2>
            {order.paid ? (
              <p className="text-sm text-green-700">Thank you for your payment.</p>
            ) : (
              <>
                <p className="text-sm text-orange-700 mb-4">
                  Please complete payment to confirm your order.
                </p>
                <Link to={`/orders/${id}/pay`} className="btn btn-accent w-full text-center">
                  Pay Now
                </Link>
              </>
            )}
          </div>

          {/* Help */}
          <div className="card">
            <h2 className="font-semibold text-brand-900 mb-2">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Contact our support team if you have any questions about your order.
            </p>
            <p className="text-brand-900 font-medium">0800 XXX XXXX</p>
            <p className="text-gray-600 text-sm">Mon-Fri 8am-6pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}
