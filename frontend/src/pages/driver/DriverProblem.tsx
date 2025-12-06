import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { driverApi } from '../../lib/api';
import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
  Clock,
  Truck,
  Users,
  CloudRain
} from 'lucide-react';

const PROBLEM_TYPES = [
  { id: 'delay', label: 'Delay', icon: Clock, color: 'yellow' },
  { id: 'traffic', label: 'Traffic Issue', icon: Truck, color: 'orange' },
  { id: 'customer', label: 'Customer Issue', icon: Users, color: 'purple' },
  { id: 'vehicle', label: 'Vehicle Problem', icon: Truck, color: 'red' },
  { id: 'weather', label: 'Weather', icon: CloudRain, color: 'blue' },
  { id: 'other', label: 'Other', icon: AlertCircle, color: 'gray' },
];

export default function DriverProblem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [problemType, setProblemType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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

  const problemMutation = useMutation({
    mutationFn: async () => {
      const fullNotes = problemType
        ? `[${PROBLEM_TYPES.find(t => t.id === problemType)?.label || problemType}] ${notes}`
        : notes;
      return driverApi.reportProblem(
        Number(id),
        fullNotes || 'Problem reported',
        location?.address,
        location?.lat,
        location?.lng
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'runsheet', id] });
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    problemMutation.mutate();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card bg-green-50 border-green-200 text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Problem Reported</h2>
          <p className="text-green-700 mb-6">
            Dispatch has been notified and will assist if needed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/driver/run-sheet/${id}`)}
              className="btn btn-accent w-full"
            >
              Back to Run Sheet
            </button>
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
          to={`/driver/run-sheet/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Run Sheet
        </Link>
        <h1 className="text-2xl font-bold text-brand-900 flex items-center">
          <AlertCircle className="h-6 w-6 mr-2" />
          Report Problem
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Problem Type */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Type of Problem</h2>
          <div className="grid grid-cols-2 gap-3">
            {PROBLEM_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = problemType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setProblemType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-gray-200 hover:border-accent-300'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-accent-600' : 'text-gray-500'}`} />
                  <p className="font-medium text-brand-900">{type.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Location</h2>
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
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Description</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input min-h-[120px]"
            placeholder="Describe the problem in detail..."
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={problemMutation.isPending}
          className="btn btn-accent w-full py-4 text-lg"
        >
          <Send className="h-5 w-5 mr-2" />
          {problemMutation.isPending ? 'Sending...' : 'Send Report'}
        </button>

        {problemMutation.isError && (
          <p className="text-red-600 text-center mt-4">
            Failed to send report. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
