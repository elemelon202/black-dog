import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotesApi } from '../lib/api';
import {
  ArrowLeft,
  MapPin,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      const response = await quotesApi.getOne(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const acceptMutation = useMutation({
    mutationFn: () => quotesApi.accept(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => quotesApi.reject(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', id] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: () => quotesApi.convertToOrder(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/orders');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">Quote not found</h3>
          <p className="text-gray-500 mb-6">The quote you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/quotes" className="btn btn-accent">
            Back to Quotes
          </Link>
        </div>
      </div>
    );
  }

  const quote = data.data?.attributes || data.attributes || data;

  // Ensure status defaults to pending if null
  const quoteStatus = quote.status || 'pending';

  console.log('Quote data:', quote);
  console.log('Quote status:', quoteStatus);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      converted: 'bg-indigo-100 text-indigo-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/quotes')}
          className="flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Quotes
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-brand-900">{quote.quote_number}</h1>
              {getStatusBadge(quoteStatus)}
            </div>
            <p className="text-gray-500 mt-1">
              Created {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-brand-900">
              £{Number(quote.total_price).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">inc. VAT</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-900 flex items-center mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              Route Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Collection</p>
                <p className="font-medium text-brand-900">{quote.pickup_postcode}</p>
                <p className="text-gray-600">{quote.pickup_country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Delivery</p>
                <p className="font-medium text-brand-900">{quote.delivery_postcode}</p>
                <p className="text-gray-600">{quote.delivery_country}</p>
              </div>
            </div>
            {quote.distance_km && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Estimated Distance</span>
                  <span className="font-medium">{Number(quote.distance_km).toFixed(0)} km ({(Number(quote.distance_km) / 1.60934).toFixed(0)} miles)</span>
                </div>
                {quote.estimated_duration_hours && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-500">Estimated Duration</span>
                    <span className="font-medium">{Number(quote.estimated_duration_hours).toFixed(1)} hours</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cargo Details */}
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
              {quote.cargo_volume_cbm && (
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

            {/* Additional Services */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Additional Services</p>
              <div className="flex flex-wrap gap-2">
                {quote.requires_tail_lift && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">Tail Lift</span>
                )}
                {quote.requires_pallet_jack && (
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">Pallet Jack</span>
                )}
                {quote.is_hazardous && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">Hazardous</span>
                )}
                {quote.is_temperature_controlled && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Temperature Controlled</span>
                )}
                {!quote.requires_tail_lift && !quote.requires_pallet_jack && !quote.is_hazardous && !quote.is_temperature_controlled && (
                  <span className="text-gray-400 text-sm">None</span>
                )}
              </div>
            </div>
          </div>

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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Breakdown */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-900 mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Price</span>
                <span>£{Number(quote.base_price).toFixed(2)}</span>
              </div>
              {quote.distance_charge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distance Charge</span>
                  <span>£{Number(quote.distance_charge).toFixed(2)}</span>
                </div>
              )}
              {quote.fuel_surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fuel Surcharge</span>
                  <span>£{Number(quote.fuel_surcharge).toFixed(2)}</span>
                </div>
              )}
              {quote.additional_services_charge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Additional Services</span>
                  <span>£{Number(quote.additional_services_charge).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>£{(Number(quote.total_price) - Number(quote.vat_amount)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (20%)</span>
                <span>£{Number(quote.vat_amount).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>£{Number(quote.total_price).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <h2 className="font-semibold text-brand-900">Quote Validity</h2>
            </div>
            <p className="text-sm text-gray-600">
              Valid until: {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}
            </p>
            {quote.expired && (
              <p className="text-sm text-red-600 mt-2">This quote has expired</p>
            )}
          </div>

          {/* Actions */}
          {quoteStatus === 'pending' && !quote.expired && (
            <div className="card">
              <h2 className="font-semibold text-brand-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending}
                  className="btn btn-accent w-full"
                >
                  {acceptMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Quote
                    </>
                  )}
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  disabled={rejectMutation.isPending}
                  className="btn btn-secondary w-full"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline Quote
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {quoteStatus === 'accepted' && (
            <div className="card bg-green-50 border-green-200">
              <h2 className="font-semibold text-green-900 mb-2">Quote Accepted!</h2>
              <p className="text-sm text-green-700 mb-4">
                Ready to proceed? Place your order now to book this shipment.
              </p>
              <button
                onClick={() => convertMutation.mutate()}
                disabled={convertMutation.isPending}
                className="btn btn-accent w-full text-lg py-3"
              >
                {convertMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          )}

          {quoteStatus === 'converted' && (
            <div className="card bg-indigo-50">
              <h2 className="font-semibold text-indigo-900 mb-2">Order Created</h2>
              <p className="text-sm text-indigo-700">
                This quote has been converted to an order.
              </p>
              <Link to="/orders" className="btn btn-accent w-full mt-4">
                View Orders
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
