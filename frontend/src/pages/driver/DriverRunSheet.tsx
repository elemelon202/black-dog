import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { driverApi } from '../../lib/api';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  Truck,
  User,
  Phone,
  Package,
  AlertTriangle,
  CheckCircle,
  FileText,
  Coffee,
  RefreshCw,
  Weight,
  Thermometer,
  AlertCircle,
  ChevronRight,
  Bell
} from 'lucide-react';

export default function DriverRunSheet() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [lastSeenVersion, setLastSeenVersion] = useState<number | null>(null);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['driver', 'runsheet', id],
    queryFn: async () => {
      const response = await driverApi.getRunSheet(Number(id));
      return response.data;
    },
    refetchInterval: 15000, // Check for updates every 15 seconds
  });

  // Check for run sheet updates
  useEffect(() => {
    if (data?.run_sheet_version) {
      if (lastSeenVersion !== null && data.run_sheet_version > lastSeenVersion) {
        setShowUpdateAlert(true);
      }
      setLastSeenVersion(data.run_sheet_version);
    }
  }, [data?.run_sheet_version, lastSeenVersion]);

  const notifyMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const orderId = Number(id);
      switch (type) {
        case 'collection':
          return driverApi.notifyCollection(orderId);
        case 'loaded':
          return driverApi.notifyLoaded(orderId);
        case 'departed':
          return driverApi.notifyDeparted(orderId);
        case 'delivery_arrival':
          return driverApi.notifyDeliveryArrival(orderId);
        case 'delivered':
          return driverApi.notifyDelivered(orderId);
        default:
          throw new Error('Unknown notification type');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'runsheet', id] });
    },
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

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card bg-red-50 border-red-200 text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Run Sheet</h2>
          <Link to="/driver" className="text-accent-600 hover:text-accent-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { order, pickup, delivery, cargo, instructions, timing, journey_events } = data;
  const orderAttrs = order?.attributes;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/driver"
          className="inline-flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Run Sheet
            </h1>
            <p className="text-gray-600">Order #{orderAttrs?.order_number}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            orderAttrs?.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
            orderAttrs?.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
            orderAttrs?.status === 'assigned' ? 'bg-indigo-100 text-indigo-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {orderAttrs?.status?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Update Alert */}
      {showUpdateAlert && (
        <div className="card bg-yellow-50 border-yellow-500 border-2 mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="font-semibold text-yellow-800">Run Sheet Updated</p>
                <p className="text-sm text-yellow-700">Dispatch has made changes to your run sheet</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpdateAlert(false)}
              className="btn btn-secondary text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Timing Overview */}
      <div className="card bg-gradient-to-r from-brand-900 to-brand-800 text-white mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Schedule
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-brand-200 text-sm">Departure</p>
            <p className="font-semibold">
              {timing?.estimated_departure
                ? new Date(timing.estimated_departure).toLocaleString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })
                : timing?.pickup_date
                  ? new Date(timing.pickup_date).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })
                  : 'TBC'}
            </p>
          </div>
          <div>
            <p className="text-brand-200 text-sm">ETA Delivery</p>
            <p className="font-semibold">
              {timing?.estimated_arrival
                ? new Date(timing.estimated_arrival).toLocaleString('en-GB', {
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })
                : timing?.delivery_date
                  ? new Date(timing.delivery_date).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })
                  : 'TBC'}
            </p>
          </div>
        </div>
        {timing?.rest_times && (
          <div className="mt-4 pt-4 border-t border-brand-700">
            <p className="text-brand-200 text-sm flex items-center">
              <Coffee className="h-4 w-4 mr-1" />
              Scheduled Rest Breaks
            </p>
            <p className="text-sm mt-1">{timing.rest_times}</p>
          </div>
        )}
      </div>

      {/* Route */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-brand-900 mb-4">Route</h2>

        {/* Pickup */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-green-700 font-medium">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold mr-3">A</div>
              PICKUP
            </div>
            <button
              onClick={() => notifyMutation.mutate({ type: 'collection' })}
              disabled={notifyMutation.isPending}
              className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Arrived
            </button>
          </div>
          <div className="ml-11">
            {pickup?.company && <p className="font-semibold text-brand-900">{pickup.company}</p>}
            <p className="text-gray-800">{pickup?.address_line1}</p>
            {pickup?.address_line2 && <p className="text-gray-800">{pickup.address_line2}</p>}
            <p className="text-gray-800">{pickup?.city}, {pickup?.postcode}</p>
            {pickup?.country !== 'United Kingdom' && <p className="text-gray-800">{pickup?.country}</p>}

            <div className="mt-3 flex items-center space-x-4 text-sm">
              <span className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {pickup?.contact_name || 'N/A'}
              </span>
              {pickup?.contact_phone && (
                <a href={`tel:${pickup.contact_phone}`} className="flex items-center text-accent-600 font-medium">
                  <Phone className="h-4 w-4 mr-1" />
                  {pickup.contact_phone}
                </a>
              )}
            </div>

            {pickup?.instructions && (
              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                <p className="text-sm font-medium text-green-800">Pickup Instructions:</p>
                <p className="text-sm text-green-700 mt-1">{pickup.instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Route Line with Actions */}
        <div className="flex items-center justify-center py-2">
          <div className="flex flex-col items-center">
            <div className="border-l-2 border-dashed border-gray-300 h-4"></div>
            <button
              onClick={() => notifyMutation.mutate({ type: 'loaded' })}
              disabled={notifyMutation.isPending}
              className="btn btn-sm btn-secondary my-2"
            >
              <Package className="h-4 w-4 mr-1" />
              Loaded
            </button>
            <button
              onClick={() => notifyMutation.mutate({ type: 'departed' })}
              disabled={notifyMutation.isPending}
              className="btn btn-sm btn-secondary my-2"
            >
              <Truck className="h-4 w-4 mr-1" />
              Departed
            </button>
            <div className="border-l-2 border-dashed border-gray-300 h-4"></div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-blue-700 font-medium">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3">B</div>
              DELIVERY
            </div>
            <button
              onClick={() => notifyMutation.mutate({ type: 'delivery_arrival' })}
              disabled={notifyMutation.isPending}
              className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Arrived
            </button>
          </div>
          <div className="ml-11">
            {delivery?.company && <p className="font-semibold text-brand-900">{delivery.company}</p>}
            <p className="text-gray-800">{delivery?.address_line1}</p>
            {delivery?.address_line2 && <p className="text-gray-800">{delivery.address_line2}</p>}
            <p className="text-gray-800">{delivery?.city}, {delivery?.postcode}</p>
            {delivery?.country !== 'United Kingdom' && <p className="text-gray-800">{delivery?.country}</p>}

            <div className="mt-3 flex items-center space-x-4 text-sm">
              <span className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {delivery?.contact_name || 'N/A'}
              </span>
              {delivery?.contact_phone && (
                <a href={`tel:${delivery.contact_phone}`} className="flex items-center text-accent-600 font-medium">
                  <Phone className="h-4 w-4 mr-1" />
                  {delivery.contact_phone}
                </a>
              )}
            </div>

            {delivery?.instructions && (
              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Delivery Instructions:</p>
                <p className="text-sm text-blue-700 mt-1">{delivery.instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Button */}
        <div className="mt-4 pt-4 border-t">
          <a
            href={`https://www.google.com/maps/dir/${encodeURIComponent([pickup?.address_line1, pickup?.city, pickup?.postcode].filter(Boolean).join(', '))}/${encodeURIComponent([delivery?.address_line1, delivery?.city, delivery?.postcode].filter(Boolean).join(', '))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Open in Google Maps
          </a>
        </div>
      </div>

      {/* Cargo Details */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-brand-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Cargo
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center">
              <Weight className="h-4 w-4 mr-2" />
              Weight
            </span>
            <span className="font-semibold">{cargo?.weight_kg || 0} kg</span>
          </div>
          {cargo?.volume_cbm && Number(cargo.volume_cbm) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Volume</span>
              <span className="font-semibold">{cargo.volume_cbm} m³</span>
            </div>
          )}
          {cargo?.description && (
            <div className="pt-3 border-t">
              <p className="text-gray-600 text-sm mb-1">Description</p>
              <p className="text-brand-900">{cargo.description}</p>
            </div>
          )}

          {/* Special Requirements */}
          <div className="flex flex-wrap gap-2 pt-3">
            {cargo?.requires_tail_lift && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Tail Lift
              </span>
            )}
            {cargo?.requires_pallet_jack && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                Pallet Jack
              </span>
            )}
            {cargo?.is_hazardous && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Hazardous (ADR)
              </span>
            )}
            {cargo?.is_temperature_controlled && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                <Thermometer className="h-4 w-4 mr-1" />
                Temperature Controlled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Route Instructions */}
      {instructions?.route && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Route Instructions
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{instructions.route}</p>
        </div>
      )}

      {/* Special Instructions */}
      {instructions?.special && (
        <div className="card bg-yellow-50 border-yellow-200 mb-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Special Instructions
          </h2>
          <p className="text-yellow-700 whitespace-pre-wrap">{instructions.special}</p>
        </div>
      )}

      {/* Journey Events Timeline */}
      {journey_events && journey_events.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Journey Log</h2>
          <div className="space-y-3">
            {journey_events.map((event: { id: string; attributes: { event_type: string; event_label: string; notes: string; created_at: string; is_urgent: boolean } }) => (
              <div
                key={event.id}
                className={`flex items-start p-3 rounded-lg ${
                  event.attributes.is_urgent ? 'bg-red-50' : 'bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                  event.attributes.is_urgent ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-brand-900">{event.attributes.event_label}</p>
                  {event.attributes.notes && (
                    <p className="text-sm text-gray-600 mt-1">{event.attributes.notes}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.attributes.created_at).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          to={`/driver/job/${id}/pod`}
          className="btn btn-accent w-full py-4 text-lg"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Complete Delivery & Get Signature
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/driver/job/${id}/problem`}
            className="btn btn-secondary"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Report Problem
          </Link>
          <Link
            to="/driver/emergency"
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency
          </Link>
        </div>
      </div>
    </div>
  );
}
