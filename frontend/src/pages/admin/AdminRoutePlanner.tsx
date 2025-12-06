import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { adminApi, vehiclesApi, financeApi, TravelBookingData } from '../../lib/api';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Clock,
  Truck,
  User,
  Phone,
  Package,
  Save,
  CheckCircle,
  AlertCircle,
  Route,
  Weight,
  Box,
  Users,
  Ship,
  Train,
  Hotel,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';

interface OrderData {
  id: string;
  attributes: {
    order_number: string;
    status: string;
    pickup_date: string;
    delivery_date: string;
    pickup_contact_name: string;
    pickup_contact_phone: string;
    delivery_contact_name: string;
    delivery_contact_phone: string;
    special_instructions: string;
    route_instructions: string;
    pickup_instructions: string;
    delivery_instructions: string;
    estimated_arrival_time: string;
  };
  relationships: {
    quote: { data: { id: string } };
    vehicle: { data: { id: string } | null };
  };
}

interface QuoteData {
  id: string;
  attributes: {
    pickup_postcode: string;
    delivery_postcode: string;
    pickup_country: string;
    delivery_country: string;
    pickup_city: string;
    delivery_city: string;
    pickup_address_line1: string;
    pickup_address_line2: string;
    pickup_company_name: string;
    delivery_address_line1: string;
    delivery_address_line2: string;
    delivery_company_name: string;
    distance_km: number;
    cargo_description: string;
    cargo_weight_kg: number;
    cargo_volume_cbm: number;
    vehicle_type_required: string;
    requires_tail_lift: boolean;
    requires_pallet_jack: boolean;
    is_hazardous: boolean;
    is_temperature_controlled: boolean;
  };
}

interface VehicleData {
  id: string;
  attributes: {
    name: string;
    registration_number: string;
    vehicle_type: string;
    max_weight_kg: number;
    max_volume_cbm: number;
    available: boolean;
    driver_id: number | null;
    driver_name: string | null;
  };
}

interface DriverData {
  id: string;
  attributes: {
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
  };
}

// Vehicle type specifications for matching
const VEHICLE_SPECS: Record<string, { maxWeight: number; maxVolume: number; name: string }> = {
  small_van: { maxWeight: 800, maxVolume: 6, name: 'Small Van' },
  large_van: { maxWeight: 1200, maxVolume: 12, name: 'Large Van' },
  luton_van: { maxWeight: 1000, maxVolume: 18, name: 'Luton Van' },
  seven_five_tonne: { maxWeight: 3500, maxVolume: 30, name: '7.5 Tonne' },
  eighteen_tonne: { maxWeight: 10000, maxVolume: 45, name: '18 Tonne' },
  twenty_six_tonne: { maxWeight: 15000, maxVolume: 60, name: '26 Tonne' },
  artic_trailer: { maxWeight: 26000, maxVolume: 85, name: '44 Tonne Artic' },
};

export default function AdminRoutePlanner() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [driverAssignmentVehicle, setDriverAssignmentVehicle] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    route_instructions: '',
    pickup_instructions: '',
    delivery_instructions: '',
    estimated_arrival_time: '',
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState<string>('eurotunnel');

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const response = await adminApi.getOrder(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', 'all'],
    queryFn: async () => {
      const response = await vehiclesApi.getAll();
      return response.data;
    },
  });

  const { data: driversData } = useQuery({
    queryKey: ['admin', 'drivers'],
    queryFn: async () => {
      const response = await adminApi.getDrivers();
      return response.data;
    },
  });

  const { data: travelBookingsData, refetch: refetchBookings } = useQuery({
    queryKey: ['travel-bookings', id],
    queryFn: async () => {
      const response = await financeApi.getTravelBookings(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const { data: providersData } = useQuery({
    queryKey: ['travel-providers'],
    queryFn: async () => {
      const response = await financeApi.getProviders();
      return response.data;
    },
  });

  const order = orderData?.data as OrderData | undefined;
  const quote = orderData?.included?.find((inc: { type: string }) => inc.type === 'quote') as QuoteData | undefined;
  const assignedVehicle = orderData?.included?.find((inc: { type: string }) => inc.type === 'vehicle') as VehicleData | undefined;
  const vehicles = (vehiclesData?.data || []) as VehicleData[];
  const drivers = (driversData?.data || []) as DriverData[];

  // Initialize form data when order loads
  useEffect(() => {
    if (order) {
      setFormData({
        route_instructions: order.attributes.route_instructions || '',
        pickup_instructions: order.attributes.pickup_instructions || '',
        delivery_instructions: order.attributes.delivery_instructions || '',
        estimated_arrival_time: order.attributes.estimated_arrival_time || '',
      });
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      adminApi.updateRouteInstructions(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const assignVehicleToOrderMutation = useMutation({
    mutationFn: (vehicleId: number) => adminApi.assignDriver(Number(id), vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      setSelectedVehicle(null);
    },
  });

  const assignDriverToVehicleMutation = useMutation({
    mutationFn: ({ vehicleId, driverId }: { vehicleId: number; driverId: number }) =>
      vehiclesApi.assignDriver(vehicleId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] });
      setSelectedDriver(null);
      setDriverAssignmentVehicle(null);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: TravelBookingData) => financeApi.createTravelBooking(Number(id), data),
    onSuccess: () => {
      refetchBookings();
      setShowBookingModal(false);
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: (bookingId: number) => financeApi.deleteTravelBooking(Number(id), bookingId),
    onSuccess: () => refetchBookings(),
  });

  const travelBookings = travelBookingsData?.data || [];
  const providers = providersData || {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Filter vehicles suitable for this job
  const getSuitableVehicles = () => {
    if (!quote) return vehicles;

    const requiredWeight = quote.attributes.cargo_weight_kg || 0;
    const requiredVolume = quote.attributes.cargo_volume_cbm || 0;
    const requiredType = quote.attributes.vehicle_type_required;

    return vehicles.filter((v) => {
      // If specific type required, filter by that
      if (requiredType && v.attributes.vehicle_type !== requiredType) {
        return false;
      }

      // Check capacity
      const specs = VEHICLE_SPECS[v.attributes.vehicle_type];
      if (specs) {
        if (requiredWeight > specs.maxWeight) return false;
        if (requiredVolume > 0 && requiredVolume > specs.maxVolume) return false;
      }

      return true;
    });
  };

  const suitableVehicles = getSuitableVehicles();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-900 mb-2">Order Not Found</h2>
          <Link to="/admin/orders" className="text-accent-600 hover:text-accent-700">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Build full addresses
  const pickupAddress = [
    quote?.attributes.pickup_company_name,
    quote?.attributes.pickup_address_line1,
    quote?.attributes.pickup_address_line2,
    quote?.attributes.pickup_city,
    quote?.attributes.pickup_postcode,
    quote?.attributes.pickup_country
  ].filter(Boolean).join(', ') || quote?.attributes.pickup_postcode || 'N/A';

  const deliveryAddress = [
    quote?.attributes.delivery_company_name,
    quote?.attributes.delivery_address_line1,
    quote?.attributes.delivery_address_line2,
    quote?.attributes.delivery_city,
    quote?.attributes.delivery_postcode,
    quote?.attributes.delivery_country
  ].filter(Boolean).join(', ') || quote?.attributes.delivery_postcode || 'N/A';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/admin/orders/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Order
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 flex items-center">
              <Route className="h-6 w-6 mr-2" />
              Route Planner
            </h1>
            <p className="text-gray-600">Order #{order.attributes.order_number}</p>
          </div>
          {saved && (
            <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Instructions saved
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Route Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pickup & Delivery Locations */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-900 mb-4">Route</h2>
            <div className="space-y-4">
              {/* Pickup */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center text-green-700 font-medium mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold mr-3">A</div>
                    Pickup
                  </div>
                  {order.attributes.pickup_date && (
                    <span className="text-sm text-green-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(order.attributes.pickup_date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 font-medium ml-11">{pickupAddress}</p>
                <div className="mt-2 ml-11 flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {order.attributes.pickup_contact_name}
                  </span>
                  <a href={`tel:${order.attributes.pickup_contact_phone}`} className="flex items-center hover:text-accent-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {order.attributes.pickup_contact_phone}
                  </a>
                </div>
              </div>

              {/* Route line */}
              <div className="flex items-center justify-center">
                <div className="border-l-2 border-dashed border-gray-300 h-8"></div>
              </div>

              {/* Delivery */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center text-blue-700 font-medium mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3">B</div>
                    Delivery
                  </div>
                  {order.attributes.delivery_date && (
                    <span className="text-sm text-blue-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(order.attributes.delivery_date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 font-medium ml-11">{deliveryAddress}</p>
                <div className="mt-2 ml-11 flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {order.attributes.delivery_contact_name}
                  </span>
                  <a href={`tel:${order.attributes.delivery_contact_phone}`} className="flex items-center hover:text-accent-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {order.attributes.delivery_contact_phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="mt-4 pt-4 border-t">
              <a
                href={`https://www.google.com/maps/dir/${encodeURIComponent(pickupAddress)}/${encodeURIComponent(deliveryAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Open Route in Google Maps
              </a>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Cargo Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <Weight className="h-4 w-4 mr-1" />
                  Weight
                </div>
                <p className="font-semibold text-brand-900">{quote?.attributes.cargo_weight_kg || 0} kg</p>
              </div>
              {quote?.attributes.cargo_volume_cbm && Number(quote.attributes.cargo_volume_cbm) > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Box className="h-4 w-4 mr-1" />
                    Volume
                  </div>
                  <p className="font-semibold text-brand-900">{quote.attributes.cargo_volume_cbm} m³</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <Navigation className="h-4 w-4 mr-1" />
                  Distance
                </div>
                <p className="font-semibold text-brand-900">{Number(quote?.attributes.distance_km || 0).toFixed(0)} km</p>
              </div>
              {quote?.attributes.vehicle_type_required && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Truck className="h-4 w-4 mr-1" />
                    Required Vehicle
                  </div>
                  <p className="font-semibold text-brand-900 capitalize">
                    {VEHICLE_SPECS[quote.attributes.vehicle_type_required]?.name || quote.attributes.vehicle_type_required.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="mt-4 flex flex-wrap gap-2">
              {quote?.attributes.requires_tail_lift && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Tail Lift Required</span>
              )}
              {quote?.attributes.requires_pallet_jack && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Pallet Jack Required</span>
              )}
              {quote?.attributes.is_hazardous && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Hazardous (ADR)</span>
              )}
              {quote?.attributes.is_temperature_controlled && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Temperature Controlled</span>
              )}
            </div>

            {quote?.attributes.cargo_description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Cargo Description</p>
                <p className="text-gray-800">{quote.attributes.cargo_description}</p>
              </div>
            )}

            {order.attributes.special_instructions && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">Customer Notes</p>
                <p className="text-gray-800">{order.attributes.special_instructions}</p>
              </div>
            )}
          </div>

          {/* Driver Instructions Form */}
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-lg font-semibold text-brand-900 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Driver Instructions
            </h2>

            <div className="space-y-4">
              {/* Estimated Arrival */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Arrival Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.estimated_arrival_time ? formData.estimated_arrival_time.slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, estimated_arrival_time: e.target.value })}
                  className="input max-w-xs"
                />
              </div>

              {/* Route Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Instructions
                </label>
                <textarea
                  value={formData.route_instructions}
                  onChange={(e) => setFormData({ ...formData, route_instructions: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Preferred routes, motorways, rest stops, areas to avoid..."
                />
              </div>

              {/* Pickup Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-green-600" />
                    Pickup Instructions
                  </span>
                </label>
                <textarea
                  value={formData.pickup_instructions}
                  onChange={(e) => setFormData({ ...formData, pickup_instructions: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Where to go, who to contact, loading bay info..."
                />
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="inline-flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                    Delivery Instructions
                  </span>
                </label>
                <textarea
                  value={formData.delivery_instructions}
                  onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Access instructions, time restrictions, who to get signature from..."
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="btn btn-accent"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Instructions'}
                </button>
              </div>
            </div>
          </form>

          {/* Travel Bookings - for EU/International routes */}
          {(quote?.attributes.pickup_country !== 'United Kingdom' || quote?.attributes.delivery_country !== 'United Kingdom') && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-900 flex items-center">
                  <Ship className="h-5 w-5 mr-2" />
                  Travel Bookings
                </h2>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Booking
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Book Channel Tunnel, ferries, hotels, and other travel for this international route.
              </p>

              {travelBookings.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Ship className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No travel bookings yet</p>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="text-accent-600 text-sm font-medium mt-2"
                  >
                    Add first booking
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {travelBookings.map((booking: { id: string; attributes: { booking_type: string; booking_type_label: string; provider: string; departure_datetime: string; departure_location: string; arrival_location: string; cost: number; status: string; confirmation_number: string; booking_url: string } }) => (
                    <div key={booking.id} className="p-3 rounded-lg border bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {booking.attributes.booking_type === 'eurotunnel' && <Train className="h-5 w-5 text-blue-600 mr-2" />}
                          {booking.attributes.booking_type === 'ferry' && <Ship className="h-5 w-5 text-blue-600 mr-2" />}
                          {booking.attributes.booking_type === 'hotel' && <Hotel className="h-5 w-5 text-purple-600 mr-2" />}
                          <div>
                            <p className="font-medium text-brand-900">{booking.attributes.booking_type_label}</p>
                            <p className="text-sm text-gray-600">{booking.attributes.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            booking.attributes.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.attributes.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.attributes.status}
                          </span>
                          <button
                            onClick={() => deleteBookingMutation.mutate(Number(booking.id))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {booking.attributes.departure_datetime && (
                          <p className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(booking.attributes.departure_datetime).toLocaleString('en-GB', {
                              weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                        <p className="mt-1">
                          {booking.attributes.departure_location} → {booking.attributes.arrival_location}
                        </p>
                        {booking.attributes.cost > 0 && (
                          <p className="font-medium mt-1">£{Number(booking.attributes.cost).toFixed(2)}</p>
                        )}
                        {booking.attributes.confirmation_number && (
                          <p className="text-xs text-gray-500 mt-1">Ref: {booking.attributes.confirmation_number}</p>
                        )}
                      </div>
                      {booking.attributes.booking_url && (
                        <a
                          href={booking.attributes.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-600 text-sm flex items-center mt-2"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View booking
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Vehicle & Driver Assignment */}
        <div className="space-y-6">
          {/* Currently Assigned */}
          {assignedVehicle && (
            <div className="card bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Assigned Vehicle
              </h3>
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium text-brand-900">{assignedVehicle.attributes.name}</p>
                <p className="text-sm text-gray-600">{assignedVehicle.attributes.registration_number}</p>
                <p className="text-sm text-gray-500 capitalize mt-1">
                  {assignedVehicle.attributes.vehicle_type?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )}

          {/* Suitable Vehicles */}
          <div className="card">
            <h3 className="font-semibold text-brand-900 mb-3 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              {assignedVehicle ? 'Reassign Vehicle' : 'Assign Vehicle'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Vehicles suitable for {quote?.attributes.cargo_weight_kg || 0}kg cargo
            </p>

            {suitableVehicles.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No suitable vehicles available</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suitableVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedVehicle === vehicle.id
                        ? 'border-accent-500 bg-accent-50'
                        : assignedVehicle?.id === vehicle.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-brand-900">{vehicle.attributes.name}</p>
                          <p className="text-xs text-gray-500">{vehicle.attributes.registration_number}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          vehicle.attributes.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {vehicle.attributes.available ? 'Available' : 'In Use'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {VEHICLE_SPECS[vehicle.attributes.vehicle_type]?.name || vehicle.attributes.vehicle_type?.replace(/_/g, ' ')}
                      </p>
                    </button>
                    {/* Driver info and assignment */}
                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                      {vehicle.attributes.driver_name ? (
                        <span className="text-xs text-gray-600 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {vehicle.attributes.driver_name}
                        </span>
                      ) : (
                        <span className="text-xs text-orange-600">No driver assigned</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDriverAssignmentVehicle(vehicle.id);
                          setSelectedDriver(null);
                        }}
                        className="text-xs text-accent-600 hover:text-accent-700 font-medium"
                      >
                        {vehicle.attributes.driver_name ? 'Change' : 'Assign'} Driver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedVehicle && (
              <button
                onClick={() => assignVehicleToOrderMutation.mutate(Number(selectedVehicle))}
                disabled={assignVehicleToOrderMutation.isPending}
                className="btn btn-accent w-full mt-4"
              >
                {assignVehicleToOrderMutation.isPending ? 'Assigning...' : 'Assign Vehicle to Order'}
              </button>
            )}
          </div>

          {/* Driver Assignment Modal */}
          {driverAssignmentVehicle && (
            <div className="card border-accent-500">
              <h3 className="font-semibold text-brand-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Assign Driver to Vehicle
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Select a driver for {suitableVehicles.find(v => v.id === driverAssignmentVehicle)?.attributes.name}
              </p>

              {drivers.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No drivers available</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {drivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver.id)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedDriver === driver.id
                          ? 'border-accent-500 bg-accent-50'
                          : 'hover:border-accent-500 hover:bg-accent-50'
                      }`}
                    >
                      <p className="font-medium text-brand-900">{driver.attributes.full_name}</p>
                      <p className="text-xs text-gray-500">{driver.attributes.phone}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setDriverAssignmentVehicle(null);
                    setSelectedDriver(null);
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                {selectedDriver && (
                  <button
                    onClick={() => assignDriverToVehicleMutation.mutate({
                      vehicleId: Number(driverAssignmentVehicle),
                      driverId: Number(selectedDriver)
                    })}
                    disabled={assignDriverToVehicleMutation.isPending}
                    className="btn btn-accent flex-1"
                  >
                    {assignDriverToVehicleMutation.isPending ? 'Assigning...' : 'Assign Driver'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Available Drivers (Overview) */}
          {!driverAssignmentVehicle && (
            <div className="card">
              <h3 className="font-semibold text-brand-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Available Drivers
              </h3>

              {drivers.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No drivers available</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {drivers.map((driver) => (
                    <div key={driver.id} className="p-3 rounded-lg border bg-gray-50">
                      <p className="font-medium text-brand-900">{driver.attributes.full_name}</p>
                      <p className="text-xs text-gray-500">{driver.attributes.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order Status */}
          <div className="card">
            <h3 className="font-semibold text-brand-900 mb-3">Order Status</h3>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                order.attributes.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.attributes.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                order.attributes.status === 'assigned' ? 'bg-indigo-100 text-indigo-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.attributes.status.replace(/_/g, ' ')}
              </span>
              <Link
                to={`/admin/orders/${id}`}
                className="text-accent-600 hover:text-accent-700 text-sm"
              >
                Manage Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Travel Booking</h3>
              <button onClick={() => setShowBookingModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createBookingMutation.mutate({
                  booking_type: formData.get('booking_type') as string,
                  provider: formData.get('provider') as string,
                  departure_datetime: formData.get('departure_datetime') as string,
                  arrival_datetime: formData.get('arrival_datetime') as string,
                  departure_location: formData.get('departure_location') as string,
                  arrival_location: formData.get('arrival_location') as string,
                  cost: Number(formData.get('cost')) || 0,
                  confirmation_number: formData.get('confirmation_number') as string,
                  booking_url: formData.get('booking_url') as string,
                  status: 'pending',
                  notes: formData.get('notes') as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
                <select
                  name="booking_type"
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                  required
                  className="input"
                >
                  <option value="eurotunnel">Eurotunnel Le Shuttle</option>
                  <option value="ferry">Ferry Crossing</option>
                  <option value="hotel">Hotel / Overnight Stay</option>
                  <option value="parking">Truck Parking</option>
                  <option value="toll_pass">Toll Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select name="provider" className="input">
                  {(providers[bookingType as keyof typeof providers] || ['Other']).map((p: string) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                  <input type="datetime-local" name="departure_datetime" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival</label>
                  <input type="datetime-local" name="arrival_datetime" className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="text"
                    name="departure_location"
                    placeholder={bookingType === 'eurotunnel' || bookingType === 'ferry' ? 'e.g., Dover' : 'Location'}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="text"
                    name="arrival_location"
                    placeholder={bookingType === 'eurotunnel' || bookingType === 'ferry' ? 'e.g., Calais' : 'Location'}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (GBP)</label>
                  <input type="number" name="cost" step="0.01" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation #</label>
                  <input type="text" name="confirmation_number" className="input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking URL</label>
                <input type="url" name="booking_url" placeholder="https://..." className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" className="input" placeholder="Any additional notes..." />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent flex-1" disabled={createBookingMutation.isPending}>
                  {createBookingMutation.isPending ? 'Saving...' : 'Add Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
