import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { driverApi, VehicleCheckData } from '../../lib/api';
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Droplets,
  Eye,
  Gauge,
  Lightbulb,
  CircleDot,
  Save
} from 'lucide-react';

export default function DriverVehicleCheck() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [checkType, setCheckType] = useState<'pre_trip' | 'post_trip'>('pre_trip');
  const [formData, setFormData] = useState<VehicleCheckData>({
    oil_level: true,
    coolant_level: true,
    tyre_condition: true,
    lights_working: true,
    brakes_working: true,
    mirrors_clean: true,
    windscreen_condition: true,
    fuel_level: 100,
    mileage: 0,
    notes: '',
    defects_found: false,
    defects_description: '',
  });
  const [submitResult, setSubmitResult] = useState<{ success: boolean; canProceed?: boolean } | null>(null);

  const checkMutation = useMutation({
    mutationFn: async () => {
      if (checkType === 'pre_trip') {
        return driverApi.preTrip(formData);
      } else {
        return driverApi.postTrip(formData);
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      setSubmitResult({
        success: true,
        canProceed: response.data.can_proceed,
      });
    },
    onError: () => {
      setSubmitResult({ success: false });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkMutation.mutate();
  };

  const toggleCheck = (field: keyof VehicleCheckData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const CheckItem = ({
    label,
    field,
    icon: Icon,
  }: {
    label: string;
    field: keyof VehicleCheckData;
    icon: React.ElementType;
  }) => {
    const value = formData[field] as boolean;
    return (
      <button
        type="button"
        onClick={() => toggleCheck(field)}
        className={`p-4 rounded-lg border-2 transition-all ${
          value
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Icon className={`h-6 w-6 mr-3 ${value ? 'text-green-600' : 'text-red-600'}`} />
            <span className="font-medium text-brand-900">{label}</span>
          </div>
          {value ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
        </div>
      </button>
    );
  };

  if (submitResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className={`card text-center py-12 ${
          submitResult.success
            ? submitResult.canProceed !== false
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          {submitResult.success ? (
            submitResult.canProceed !== false ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Check Completed</h2>
                <p className="text-green-700 mb-6">All checks passed. You're good to go!</p>
              </>
            ) : (
              <>
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-yellow-800 mb-2">Issues Found</h2>
                <p className="text-yellow-700 mb-6">
                  Vehicle check recorded. Please contact dispatch about the defects.
                </p>
              </>
            )
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
              <p className="text-red-700 mb-6">Failed to submit vehicle check. Please try again.</p>
            </>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/driver')}
              className="btn btn-accent w-full"
            >
              Back to Dashboard
            </button>
            {!submitResult.success && (
              <button
                onClick={() => setSubmitResult(null)}
                className="btn btn-secondary w-full"
              >
                Try Again
              </button>
            )}
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
        <h1 className="text-2xl font-bold text-brand-900 flex items-center">
          <Truck className="h-6 w-6 mr-2" />
          Vehicle Check
        </h1>
      </div>

      {/* Check Type Selector */}
      <div className="card mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCheckType('pre_trip')}
            className={`p-4 rounded-lg border-2 transition-all ${
              checkType === 'pre_trip'
                ? 'border-accent-500 bg-accent-50'
                : 'border-gray-200 hover:border-accent-300'
            }`}
          >
            <p className="font-semibold text-brand-900">Pre-Trip</p>
            <p className="text-sm text-gray-500">Before starting</p>
          </button>
          <button
            type="button"
            onClick={() => setCheckType('post_trip')}
            className={`p-4 rounded-lg border-2 transition-all ${
              checkType === 'post_trip'
                ? 'border-accent-500 bg-accent-50'
                : 'border-gray-200 hover:border-accent-300'
            }`}
          >
            <p className="font-semibold text-brand-900">Post-Trip</p>
            <p className="text-sm text-gray-500">End of day</p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Safety Checks */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Safety Checks</h2>
          <p className="text-sm text-gray-500 mb-4">Tap each item to toggle OK/Not OK</p>

          <div className="space-y-3">
            <CheckItem label="Oil Level" field="oil_level" icon={Droplets} />
            <CheckItem label="Coolant Level" field="coolant_level" icon={Droplets} />
            <CheckItem label="Tyre Condition" field="tyre_condition" icon={CircleDot} />
            <CheckItem label="Lights Working" field="lights_working" icon={Lightbulb} />
            <CheckItem label="Brakes Working" field="brakes_working" icon={Gauge} />
            <CheckItem label="Mirrors Clean" field="mirrors_clean" icon={Eye} />
            <CheckItem label="Windscreen Condition" field="windscreen_condition" icon={Eye} />
          </div>
        </div>

        {/* Readings */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Readings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Level (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.fuel_level}
                onChange={(e) => setFormData({ ...formData, fuel_level: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Empty</span>
                <span className="font-semibold text-brand-900">{formData.fuel_level}%</span>
                <span>Full</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Mileage
              </label>
              <input
                type="number"
                value={formData.mileage || ''}
                onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                className="input"
                placeholder="Enter current mileage"
              />
            </div>
          </div>
        </div>

        {/* Defects */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Defects</h2>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, defects_found: !formData.defects_found })}
            className={`w-full p-4 rounded-lg border-2 transition-all mb-4 ${
              formData.defects_found
                ? 'border-red-500 bg-red-50'
                : 'border-green-500 bg-green-50'
            }`}
          >
            <div className="flex items-center justify-center">
              {formData.defects_found ? (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Defects Found</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">No Defects</span>
                </>
              )}
            </div>
          </button>

          {formData.defects_found && (
            <textarea
              value={formData.defects_description}
              onChange={(e) => setFormData({ ...formData, defects_description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Describe the defects found..."
              required
            />
          )}
        </div>

        {/* Notes */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-4">Additional Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input min-h-[80px]"
            placeholder="Any other observations..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={checkMutation.isPending}
          className="btn btn-accent w-full py-4 text-lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {checkMutation.isPending ? 'Submitting...' : 'Submit Vehicle Check'}
        </button>
      </form>
    </div>
  );
}
