import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { quotesApi, vehiclesApi } from '../lib/api';
import { QuoteEstimate, VehicleType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface QuoteFormData {
  pickup_postcode: string;
  delivery_postcode: string;
  pickup_country: string;
  delivery_country: string;
  cargo_weight_kg: number;
  cargo_volume_cbm?: number;
  cargo_description: string;
  vehicle_type_required?: string;
  requires_tail_lift: boolean;
  requires_pallet_jack: boolean;
  is_hazardous: boolean;
  is_temperature_controlled: boolean;
  notes?: string;
}

const countries = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PL', name: 'Poland' },
  { code: 'AT', name: 'Austria' },
  { code: 'DK', name: 'Denmark' },
  { code: 'SE', name: 'Sweden' },
  { code: 'IE', name: 'Ireland' },
];

export default function Quote() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
  const [step, setStep] = useState(1);

  const { data: vehicleTypes } = useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: async () => {
      const response = await vehiclesApi.getVehicleTypes();
      return response.data.vehicle_types as VehicleType[];
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    defaultValues: {
      pickup_postcode: '',
      delivery_postcode: '',
      pickup_country: 'GB',
      delivery_country: 'GB',
      cargo_weight_kg: 0,
      cargo_volume_cbm: 0,
      cargo_description: '',
      vehicle_type_required: '',
      requires_tail_lift: false,
      requires_pallet_jack: false,
      is_hazardous: false,
      is_temperature_controlled: false,
      notes: '',
    },
  });

  const estimateMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      // Ensure numeric values are valid numbers
      const cleanedData = {
        ...data,
        cargo_weight_kg: Number(data.cargo_weight_kg) || 0,
        cargo_volume_cbm: Number(data.cargo_volume_cbm) || undefined,
      };
      console.log('Sending quote request with data:', cleanedData);
      const response = await quotesApi.quickEstimate(cleanedData);
      console.log('Received quote response:', response.data);
      return response;
    },
    onSuccess: (response) => {
      console.log('Setting estimate:', response.data.estimate);
      setEstimate(response.data.estimate);
      setStep(2);
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: (data: QuoteFormData) => quotesApi.create(data),
    onSuccess: (response) => {
      navigate(`/quotes/${response.data.data.id}`);
    },
  });

  const onSubmit: SubmitHandler<QuoteFormData> = (data) => {
    if (step === 1) {
      estimateMutation.mutate(data);
    } else {
      if (isAuthenticated) {
        createQuoteMutation.mutate(data);
      } else {
        navigate('/login', { state: { from: '/quote', quoteData: data } });
      }
    }
  };

  const deliveryCountry = watch('delivery_country');
  const isInternational = deliveryCountry !== 'GB';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-brand-900 mb-4">
          Get an Instant Quote
        </h1>
        <p className="text-lg text-gray-600">
          Enter your shipment details for a competitive price estimate
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-brand-900 text-white' : 'bg-gray-200'
            }`}
          >
            1
          </div>
          <div className="w-24 h-1 bg-gray-200">
            <div
              className={`h-full ${step >= 2 ? 'bg-brand-900' : 'bg-gray-200'}`}
              style={{ width: step >= 2 ? '100%' : '0%' }}
            />
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-brand-900 text-white' : 'bg-gray-200'
            }`}
          >
            2
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-brand-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipment Details
                </h2>

                {/* Collection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Collection Postcode</label>
                    <input
                      {...register('pickup_postcode')}
                      placeholder="e.g., SW1A 1AA"
                      className="input"
                    />
                    {errors.pickup_postcode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pickup_postcode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">Collection Country</label>
                    <select {...register('pickup_country')} className="input">
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Delivery Postcode</label>
                    <input
                      {...register('delivery_postcode')}
                      placeholder="e.g., M1 1AA"
                      className="input"
                    />
                    {errors.delivery_postcode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.delivery_postcode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label">Delivery Country</label>
                    <select {...register('delivery_country')} className="input">
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isInternational && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium">International Shipment</p>
                      <p className="text-blue-600 text-sm">
                        Additional customs documentation may be required. We'll handle all clearance for you.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cargo Details */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-brand-900 flex items-center mb-4">
                    <Package className="h-5 w-5 mr-2" />
                    Cargo Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Weight (kg)</label>
                      <input
                        type="number"
                        {...register('cargo_weight_kg', { valueAsNumber: true })}
                        placeholder="e.g., 500"
                        className="input"
                        min="1"
                      />
                      {errors.cargo_weight_kg && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.cargo_weight_kg.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Volume (m³) - Optional</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('cargo_volume_cbm', { valueAsNumber: true })}
                        placeholder="e.g., 2.5"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="label">Cargo Description</label>
                    <textarea
                      {...register('cargo_description')}
                      rows={3}
                      placeholder="Describe your goods (e.g., 10 pallets of electronics)"
                      className="input"
                    />
                    {errors.cargo_description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.cargo_description.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="label">Vehicle Type (Optional)</label>
                    <select {...register('vehicle_type_required')} className="input">
                      <option value="">Auto-select based on weight</option>
                      {vehicleTypes?.map((v) => (
                        <option key={v.type} value={v.type}>
                          {v.display_name} - up to {v.max_weight_kg}kg
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Services */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold text-brand-900 flex items-center mb-4">
                    <Truck className="h-5 w-5 mr-2" />
                    Additional Services
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        {...register('requires_tail_lift')}
                        className="h-4 w-4 text-brand-900 rounded"
                      />
                      <span>Tail Lift Required (+£35)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        {...register('requires_pallet_jack')}
                        className="h-4 w-4 text-brand-900 rounded"
                      />
                      <span>Pallet Jack Required (+£25)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        {...register('is_hazardous')}
                        className="h-4 w-4 text-brand-900 rounded"
                      />
                      <span>Hazardous Goods (ADR)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        {...register('is_temperature_controlled')}
                        className="h-4 w-4 text-brand-900 rounded"
                      />
                      <span>Temperature Controlled</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={estimateMutation.isPending}
                  className="btn btn-accent w-full py-3 text-lg"
                >
                  {estimateMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    'Get Quote Estimate'
                  )}
                </button>
              </div>
            )}

            {step === 2 && estimate && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-brand-900">
                    Your Quote Estimate
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-brand-600 hover:text-brand-800"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium">Quote Ready</p>
                    <p className="text-green-600 text-sm">
                      This estimate is valid for 14 days. Create an account to save and book.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium">{Number(estimate.distance_km).toFixed(0)} km</span>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-600">Estimated Transit</span>
                    <span className="font-medium">
                      {Number(estimate.estimated_duration_hours).toFixed(1)} hours
                    </span>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    {estimate.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.description}</span>
                        <span>£{Number(item.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total (inc. VAT)</span>
                      <span className="text-accent-600">
                        £{Number(estimate.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Additional Notes (Optional)</label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="Any special requirements or instructions..."
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createQuoteMutation.isPending}
                  className="btn btn-accent w-full py-3 text-lg"
                >
                  {createQuoteMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Quote...
                    </>
                  ) : isAuthenticated ? (
                    'Save Quote & Proceed'
                  ) : (
                    'Login to Save Quote'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-brand-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Our team is here to help you choose the right service for your shipment.
            </p>
            <p className="text-brand-900 font-medium">0800 XXX XXXX</p>
            <p className="text-gray-600 text-sm">Mon-Fri 8am-6pm</p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-brand-900 mb-4">What's Included</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Door-to-door delivery</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Real-time tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Proof of delivery</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Goods-in-transit insurance</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Customs clearance (EU)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
