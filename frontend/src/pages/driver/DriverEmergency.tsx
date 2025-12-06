import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { driverApi } from '../../lib/api';
import {
  ArrowLeft,
  AlertTriangle,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
  Shield
} from 'lucide-react';

export default function DriverEmergency() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get current job for emergency reporting
  const { data: dashboardData } = useQuery({
    queryKey: ['driver', 'dashboard'],
    queryFn: async () => {
      const response = await driverApi.getDashboard();
      return response.data;
    },
  });

  const currentOrderId = dashboardData?.current_job?.data?.id;

  // Get location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocating(false);
    }
  };

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrderId) {
        throw new Error('No active order');
      }
      return driverApi.reportEmergency(
        Number(currentOrderId),
        notes || 'Emergency reported',
        location?.address,
        location?.lat,
        location?.lng
      );
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    emergencyMutation.mutate();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card bg-green-50 border-green-200 text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Emergency Reported</h2>
          <p className="text-green-700 mb-6">
            Dispatch has been notified and will contact you shortly.
          </p>
          <div className="space-y-3">
            <a
              href="tel:+441onal"
              className="btn bg-red-600 text-white hover:bg-red-700 w-full"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Dispatch: 0800 123 4567
            </a>
            <button
              onClick={() => navigate('/driver')}
              className="btn btn-secondary w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/driver"
          className="inline-flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-red-600 flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2" />
          Emergency
        </h1>
      </div>

      {/* Emergency Contacts */}
      <div className="card bg-red-50 border-red-200 mb-6">
        <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Emergency Contacts
        </h2>
        <div className="space-y-3">
          <a
            href="tel:999"
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200 hover:border-red-400"
          >
            <div>
              <p className="font-semibold text-red-800">Emergency Services</p>
              <p className="text-sm text-red-600">Police, Fire, Ambulance</p>
            </div>
            <span className="text-2xl font-bold text-red-600">999</span>
          </a>
          <a
            href="tel:08001234567"
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200 hover:border-red-400"
          >
            <div>
              <p className="font-semibold text-red-800">Black Dog Dispatch</p>
              <p className="text-sm text-red-600">24/7 Control Room</p>
            </div>
            <span className="text-lg font-bold text-red-600">0800 123 4567</span>
          </a>
        </div>
      </div>

      {/* Report Form */}
      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Report to Dispatch
          </h2>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Location
            </label>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              {locating ? (
                <span className="text-gray-500 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Getting location...
                </span>
              ) : location ? (
                <span className="text-brand-900">{location.address}</span>
              ) : (
                <button
                  type="button"
                  onClick={getLocation}
                  className="text-accent-600 hover:text-accent-700"
                >
                  Enable location
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's happening?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[120px]"
              placeholder="Describe the emergency situation..."
            />
          </div>

          {/* Quick Options */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {['Accident', 'Breakdown', 'Medical', 'Theft', 'Road blocked', 'Weather'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setNotes((prev) => prev ? `${prev}, ${option}` : option)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {!currentOrderId && (
            <div className="p-3 bg-yellow-50 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                No active job found. Emergency will be reported to general dispatch.
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={emergencyMutation.isPending}
          className="btn bg-red-600 text-white hover:bg-red-700 w-full py-4 text-lg"
        >
          <Send className="h-5 w-5 mr-2" />
          {emergencyMutation.isPending ? 'Sending...' : 'Send Emergency Report'}
        </button>

        {emergencyMutation.isError && (
          <p className="text-red-600 text-center mt-4">
            Failed to send report. Please call dispatch directly.
          </p>
        )}
      </form>
    </div>
  );
}
