import { Link } from 'react-router-dom';
import {
  Truck,
  Ruler,
  Box,
  CheckCircle,
  ArrowRight,
  Info
} from 'lucide-react';

interface VehicleInfo {
  name: string;
  type: string;
  maxWeight: string;
  maxVolume: string;
  loadLength: string;
  loadWidth: string;
  loadHeight: string;
  palletSpaces: string;
  description: string;
  suitableFor: string[];
  notSuitableFor: string[];
  features: string[];
  capacityNote: string;
}

const vehicles: VehicleInfo[] = [
  {
    name: 'Small Van',
    type: 'small_van',
    maxWeight: '800 kg',
    maxVolume: '6 m³',
    loadLength: '2.4 m',
    loadWidth: '1.5 m',
    loadHeight: '1.6 m',
    palletSpaces: '2 Euro pallets',
    description: 'Perfect for urgent same-day deliveries and small consignments. Ideal for documents, parcels, and light cargo that needs to get there fast.',
    suitableFor: [
      'Urgent document deliveries',
      'Small parcels and packages',
      'Medical samples and specimens',
      'Retail restocking',
      'E-commerce deliveries',
      'Computer equipment',
      'Small furniture items'
    ],
    notSuitableFor: [
      'Large palletised goods',
      'Heavy machinery',
      'Full house moves',
      'Bulk materials'
    ],
    features: [
      'Same-day delivery available',
      'Easy access urban areas',
      'Low emissions zones compliant',
      'Quick loading/unloading'
    ],
    capacityNote: 'Ideal for small loads'
  },
  {
    name: 'Large Van',
    type: 'large_van',
    maxWeight: '1,200 kg',
    maxVolume: '12 m³',
    loadLength: '3.7 m',
    loadWidth: '1.7 m',
    loadHeight: '1.8 m',
    palletSpaces: '4 Euro pallets',
    description: 'Versatile workhorse suitable for most small business deliveries. Good balance between capacity and manoeuvrability.',
    suitableFor: [
      'Small pallet deliveries (up to 4 pallets)',
      'Office furniture',
      'Retail stock',
      'Exhibition materials',
      'White goods / appliances',
      'Small machinery',
      'Building materials (light)'
    ],
    notSuitableFor: [
      'Full pallet loads (5+ pallets)',
      'Heavy industrial equipment',
      'Long items over 3.5m',
      'Very heavy single items'
    ],
    features: [
      'Tail lift option available',
      'Easy parking in urban areas',
      'Side loading door',
      'Overnight deliveries'
    ],
    capacityNote: 'Popular choice for medium loads'
  },
  {
    name: 'Luton Van',
    type: 'luton_van',
    maxWeight: '1,000 kg',
    maxVolume: '18 m³',
    loadLength: '4.2 m',
    loadWidth: '2.0 m',
    loadHeight: '2.1 m',
    palletSpaces: '5-6 Euro pallets',
    description: 'Box body van with walk-in loading area. Excellent for bulky, lightweight items and furniture moves.',
    suitableFor: [
      'Furniture deliveries',
      'House/office moves (small)',
      'Bulky but light items',
      'Trade show equipment',
      'Artwork and antiques',
      'Clothing on hangers',
      'Mattresses and bedding'
    ],
    notSuitableFor: [
      'Very heavy loads (over 1 tonne)',
      'Dense building materials',
      'Heavy machinery',
      'Full industrial pallets'
    ],
    features: [
      'Walk-in load area',
      'Tail lift as standard',
      'Ideal for fragile items',
      'Weather-protected loading'
    ],
    capacityNote: 'Best for volume over weight'
  },
  {
    name: '7.5 Tonne Rigid',
    type: 'seven_five_tonne',
    maxWeight: '3,500 kg',
    maxVolume: '30 m³',
    loadLength: '6.0 m',
    loadWidth: '2.4 m',
    loadHeight: '2.2 m',
    palletSpaces: '10-12 Euro pallets',
    description: 'The first step into "proper" trucks. Can be driven on a standard C1 licence. Perfect for regular business deliveries and distribution.',
    suitableFor: [
      'Regular distribution runs',
      'Multi-drop deliveries',
      'Construction materials',
      'Retail store deliveries',
      'FMCG distribution',
      'Agricultural supplies',
      'Brewing/drinks delivery'
    ],
    notSuitableFor: [
      'Very heavy single loads',
      'Full container loads',
      'Extra-long items (7m+)',
      'Maximum weight freight'
    ],
    features: [
      'C1 licence (no HGV required)',
      'Tail lift as standard',
      'Urban delivery friendly',
      'Loading ramp available'
    ],
    capacityNote: 'Up to 10 pallets capacity'
  },
  {
    name: '18 Tonne Rigid',
    type: 'eighteen_tonne',
    maxWeight: '10,000 kg',
    maxVolume: '45 m³',
    loadLength: '7.5 m',
    loadWidth: '2.4 m',
    loadHeight: '2.5 m',
    palletSpaces: '14-16 Euro pallets',
    description: 'Heavy-duty rigid truck for substantial loads. Features sleeper cab for overnight journeys. Ideal for regular freight and industrial deliveries.',
    suitableFor: [
      'Heavy industrial freight',
      'Building materials',
      'Machinery and equipment',
      'Steel and metal products',
      'Large retail deliveries',
      'Manufacturing supplies',
      'Overnight long-distance runs'
    ],
    notSuitableFor: [
      'Full container equivalents',
      'Very long loads (8m+)',
      'Maximum weight shipments',
      'Tight urban locations'
    ],
    features: [
      'Sleeper cab for driver rest',
      'Overnight journeys possible',
      'Tail lift as standard',
      'Heavy-duty suspension'
    ],
    capacityNote: 'Up to 16 pallets capacity'
  },
  {
    name: '26 Tonne Rigid',
    type: 'twenty_six_tonne',
    maxWeight: '15,000 kg',
    maxVolume: '60 m³',
    loadLength: '9.0 m',
    loadWidth: '2.4 m',
    loadHeight: '2.7 m',
    palletSpaces: '18-20 Euro pallets',
    description: 'Large rigid truck for heavy and bulky freight. Sleeper cab equipped for multi-day journeys. Perfect for construction and industrial sectors.',
    suitableFor: [
      'Heavy construction loads',
      'Bulk building materials',
      'Large machinery',
      'Plant and equipment',
      'Agricultural machinery',
      'Steel fabrications',
      'Container destuffing'
    ],
    notSuitableFor: [
      'Very tight access sites',
      'Maximum weight (26t+)',
      'Extra-long loads (10m+)',
      'Narrow country lanes'
    ],
    features: [
      'Sleeper cab included',
      'Multi-day journeys',
      'Rear and side loading',
      'Crane mount available'
    ],
    capacityNote: 'Up to 20 pallets capacity'
  },
  {
    name: '44 Tonne Artic',
    type: 'artic_trailer',
    maxWeight: '26,000 kg',
    maxVolume: '85 m³',
    loadLength: '13.6 m',
    loadWidth: '2.5 m',
    loadHeight: '2.7 m',
    palletSpaces: '26 Euro pallets (double stacked: 52)',
    description: 'Maximum capacity articulated lorry for the largest shipments. Full container equivalent. Sleeper cab for European journeys.',
    suitableFor: [
      'Full container loads',
      'Maximum weight shipments',
      'European long-haul',
      'Industrial raw materials',
      'Bulk retail distribution',
      'Manufacturing components',
      'Import/export freight'
    ],
    notSuitableFor: [
      'Small consignments',
      'Restricted access sites',
      'Very urban deliveries',
      'Same-day urgent loads'
    ],
    features: [
      'Maximum UK capacity',
      'Sleeper cab for driver',
      'European operations',
      'Curtainsider or box available'
    ],
    capacityNote: 'Maximum UK road capacity'
  }
];

export default function Vehicles() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Vehicle Guide</h1>
            <p className="text-xl text-gray-300">
              Choose the right vehicle for your shipment. From small vans for urgent parcels
              to 44-tonne artics for maximum capacity loads.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Reference Table */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-6">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm">
              <thead className="bg-brand-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left rounded-tl-xl">Vehicle</th>
                  <th className="px-4 py-3 text-center">Max Weight</th>
                  <th className="px-4 py-3 text-center">Volume</th>
                  <th className="px-4 py-3 text-center">Pallets</th>
                  <th className="px-4 py-3 text-center rounded-tr-xl">Load Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map((vehicle, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-brand-900">{vehicle.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{vehicle.maxWeight}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{vehicle.maxVolume}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{vehicle.palletSpaces}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{vehicle.loadLength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Detailed Vehicle Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-8">Detailed Vehicle Information</h2>

          <div className="space-y-8">
            {vehicles.map((vehicle, index) => (
              <div key={index} className="card" id={vehicle.type}>
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Vehicle Info */}
                  <div className="lg:w-1/3">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 rounded-lg bg-brand-100">
                        <Truck className="h-8 w-8 text-brand-700" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-brand-900">{vehicle.name}</h3>
                        <span className="text-gray-600">{vehicle.capacityNote}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{vehicle.description}</p>

                    {/* Dimensions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-brand-900 mb-3 flex items-center">
                        <Ruler className="h-4 w-4 mr-2" />
                        Dimensions
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Max Weight:</span>
                          <span className="font-medium text-brand-900 ml-2">{vehicle.maxWeight}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <span className="font-medium text-brand-900 ml-2">{vehicle.maxVolume}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Length:</span>
                          <span className="font-medium text-brand-900 ml-2">{vehicle.loadLength}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Width:</span>
                          <span className="font-medium text-brand-900 ml-2">{vehicle.loadWidth}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Height:</span>
                          <span className="font-medium text-brand-900 ml-2">{vehicle.loadHeight}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Pallets:</span>
                          <span className="font-medium text-brand-900 ml-2">{vehicle.palletSpaces}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Suitability */}
                  <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Suitable For */}
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Suitable For
                      </h4>
                      <ul className="space-y-2">
                        {vehicle.suitableFor.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">+</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Not Suitable For */}
                    <div>
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Not Recommended For
                      </h4>
                      <ul className="space-y-2">
                        {vehicle.notSuitableFor.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-red-500 mr-2">-</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Features */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-brand-900 mb-3 flex items-center">
                        <Box className="h-5 w-5 mr-2" />
                        Key Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.map((feature, i) => (
                          <span key={i} className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Choosing */}
      <section className="py-16 bg-brand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-brand-900 mb-4">
            Not Sure Which Vehicle You Need?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Don't worry - our quoting system will automatically recommend the most suitable
            vehicle based on your cargo weight and dimensions. Or give us a call and we'll help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quote"
              className="btn btn-accent text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              Get a Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="tel:0800XXXXXXX"
              className="btn btn-secondary text-lg px-8 py-3 inline-flex items-center justify-center"
            >
              Call 0800 XXX XXXX
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
