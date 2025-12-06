import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '../lib/api';
import {
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface TrackingResult {
  tracking_number: string;
  status: string;
  estimated_delivery: string | null;
  route_progress: number | null;
  eta: string | null;
  last_update: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'assigned', label: 'Driver Assigned', icon: Truck },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const getStatusIndex = (status: string): number => {
  const index = statusSteps.findIndex((s) => s.key === status);
  return index === -1 ? 0 : index;
};

export default function Track() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);

  const trackMutation = useMutation({
    mutationFn: (number: string) => ordersApi.track(number),
    onSuccess: (response) => {
      setResult(response.data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      trackMutation.mutate(trackingNumber.trim());
    }
  };

  const currentStep = result ? getStatusIndex(result.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-brand-900 mb-4">
          Track Your Shipment
        </h1>
        <p className="text-lg text-gray-600">
          Enter your tracking number to see real-time delivery status
        </p>
      </div>

      {/* Search Form */}
      <div className="card mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              placeholder="Enter tracking number (e.g., BDE1A2B3C4D5E6)"
              className="input text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={trackMutation.isPending}
            className="btn btn-accent px-8"
          >
            {trackMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Track'
            )}
          </button>
        </form>
      </div>

      {/* Error State */}
      {trackMutation.isError && (
        <div className="card bg-red-50 border-red-200 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-red-800">Tracking number not found</p>
              <p className="text-red-600 text-sm">
                Please check the tracking number and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Result */}
      {result && (
        <div className="space-y-8">
          {/* Status Overview */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p className="text-xl font-bold text-brand-900">{result.tracking_number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="text-xl font-bold text-accent-600 capitalize">
                  {result.status.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-full bg-accent-500 transition-all duration-500"
                  style={{
                    width: `${Math.min((currentStep / (statusSteps.length - 1)) * 100, 100)}%`,
                  }}
                />
              </div>

              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isComplete = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isComplete
                            ? 'bg-accent-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-accent-200' : ''}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`mt-2 text-xs text-center ${
                          isComplete ? 'text-brand-900 font-medium' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.eta && (
              <div className="card">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-accent-500" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Arrival</p>
                    <p className="font-semibold text-brand-900">
                      {new Date(result.eta).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result.route_progress !== null && (
              <div className="card">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-accent-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Journey Progress</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-accent-500 rounded-full h-2 transition-all"
                          style={{ width: `${result.route_progress}%` }}
                        />
                      </div>
                      <span className="font-semibold text-brand-900">
                        {result.route_progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-semibold text-brand-900">
                    {new Date(result.last_update).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status Messages */}
          {result.status === 'delivered' && (
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-bold text-green-800">Successfully Delivered!</p>
                  <p className="text-green-600">
                    Your shipment has been delivered. Thank you for choosing Black Dog Express.
                  </p>
                </div>
              </div>
            </div>
          )}

          {result.status === 'in_transit' && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <Truck className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-bold text-blue-800">On Its Way!</p>
                  <p className="text-blue-600">
                    Your shipment is currently in transit and making good progress.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!result && !trackMutation.isError && (
        <div className="card bg-gray-50 mt-8">
          <h3 className="font-semibold text-brand-900 mb-4">Where to find your tracking number?</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Check your order confirmation email</li>
            <li>• Look for messages starting with "BDE" followed by 12 characters</li>
            <li>• Contact us if you need assistance locating your tracking number</li>
          </ul>
        </div>
      )}
    </div>
  );
}
