import { Link } from 'react-router-dom';
import {
  Truck,
  Clock,
  MapPin,
  Package,
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  Calendar,
  Zap,
  Building2,
  Factory
} from 'lucide-react';

const deliveryZones = [
  {
    name: 'London & South East',
    areas: ['Greater London', 'Kent', 'Surrey', 'Sussex', 'Essex', 'Hertfordshire', 'Berkshire'],
    typicalTime: 'Same day - Next day',
    notes: 'Congestion zone and ULEZ surcharges may apply for central London'
  },
  {
    name: 'Midlands',
    areas: ['Birmingham', 'Coventry', 'Leicester', 'Nottingham', 'Derby', 'Northampton'],
    typicalTime: 'Same day - Next day',
    notes: 'Central hub location - excellent connections nationwide'
  },
  {
    name: 'North West',
    areas: ['Manchester', 'Liverpool', 'Chester', 'Preston', 'Blackpool', 'Lancaster'],
    typicalTime: 'Same day - Next day',
    notes: 'Major distribution hub with port access'
  },
  {
    name: 'North East',
    areas: ['Newcastle', 'Sunderland', 'Durham', 'Middlesbrough', 'York', 'Leeds', 'Sheffield'],
    typicalTime: 'Next day',
    notes: 'Industrial heartland with excellent motorway access'
  },
  {
    name: 'South West',
    areas: ['Bristol', 'Bath', 'Exeter', 'Plymouth', 'Cornwall', 'Dorset', 'Somerset'],
    typicalTime: 'Next day',
    notes: 'Some rural areas may require additional day'
  },
  {
    name: 'Wales',
    areas: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bangor'],
    typicalTime: 'Next day',
    notes: 'North Wales may require additional planning for larger vehicles'
  },
  {
    name: 'Scotland',
    areas: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness'],
    typicalTime: '1-2 days',
    notes: 'Highlands and Islands may require specialist arrangements'
  },
  {
    name: 'Northern Ireland',
    areas: ['Belfast', 'Derry', 'Newry', 'Lisburn'],
    typicalTime: '2-3 days',
    notes: 'Ferry crossing required - additional costs apply'
  }
];

const services = [
  {
    icon: Zap,
    title: 'Same Day Delivery',
    description: 'Urgent shipments collected within 60-90 minutes and delivered the same day.',
    features: ['Collection within 90 mins', 'Direct dedicated vehicle', 'Real-time tracking', 'POD on delivery']
  },
  {
    icon: Clock,
    title: 'Next Day Delivery',
    description: 'Cost-effective overnight service for non-urgent shipments.',
    features: ['Collection same day', 'Delivery by end of next business day', 'Consolidation options', 'Timed delivery available']
  },
  {
    icon: Calendar,
    title: 'Scheduled Delivery',
    description: 'Plan ahead with guaranteed delivery slots for regular shipments.',
    features: ['Book up to 2 weeks ahead', 'AM/PM delivery windows', 'Regular route discounts', 'Dedicated account manager']
  },
  {
    icon: Building2,
    title: 'Business to Business',
    description: 'Regular distribution runs for manufacturers, wholesalers and retailers.',
    features: ['Multi-drop routes', 'Warehouse collection', 'Proof of delivery', 'Monthly invoicing']
  }
];

const industryExpertise = [
  { name: 'Automotive Parts', icon: '🚗' },
  { name: 'Pharmaceuticals', icon: '💊' },
  { name: 'Construction Materials', icon: '🏗️' },
  { name: 'Retail & FMCG', icon: '🛒' },
  { name: 'Manufacturing', icon: '⚙️' },
  { name: 'Events & Exhibitions', icon: '🎪' },
  { name: 'Food & Beverage', icon: '🍽️' },
  { name: 'Technology & IT', icon: '💻' }
];

export default function UkShipping() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-accent-400 mb-4">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">UK Nationwide Coverage</span>
            </div>
            <h1 className="text-4xl font-bold mb-6">UK Road Transport</h1>
            <p className="text-xl text-gray-300 mb-8">
              Comprehensive road freight solutions across England, Scotland, Wales and Northern Ireland.
              From urgent same-day deliveries to scheduled distribution runs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/quote" className="btn btn-accent text-lg px-6 py-3">
                Get a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="tel:0800XXXXXXX" className="btn btn-secondary text-lg px-6 py-3">
                <Phone className="mr-2 h-5 w-5" />
                0800 XXX XXXX
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">98%</div>
              <div className="text-gray-600">On-time delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">24/7</div>
              <div className="text-gray-600">Operations support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">500+</div>
              <div className="text-gray-600">Vehicles available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">100%</div>
              <div className="text-gray-600">UK coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-8">UK Delivery Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="card">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-brand-100">
                      <Icon className="h-6 w-6 text-brand-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brand-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <ul className="space-y-1">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Zones */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-2">UK Delivery Zones</h2>
          <p className="text-gray-600 mb-8">
            We deliver to every postcode in the UK. Typical transit times shown below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deliveryZones.map((zone, index) => (
              <div key={index} className="border rounded-xl p-4 hover:border-brand-300 transition-colors">
                <h3 className="font-semibold text-brand-900 mb-2">{zone.name}</h3>
                <div className="flex items-center text-sm text-accent-600 mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  {zone.typicalTime}
                </div>
                <p className="text-xs text-gray-500 mb-3">{zone.areas.join(', ')}</p>
                <p className="text-xs text-gray-400 italic">{zone.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Expertise */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-2">Industry Expertise</h2>
          <p className="text-gray-600 mb-8">
            Specialist knowledge across key sectors with tailored handling requirements.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industryExpertise.map((industry, index) => (
              <div key={index} className="bg-white rounded-xl p-4 text-center border hover:border-brand-300 transition-colors">
                <div className="text-3xl mb-2">{industry.icon}</div>
                <div className="font-medium text-brand-900">{industry.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Fleet */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-brand-900 mb-2">UK Fleet Options</h2>
              <p className="text-gray-600">
                The right vehicle for every UK delivery requirement.
              </p>
            </div>
            <Link to="/vehicles" className="text-accent-600 hover:text-accent-700 font-medium flex items-center mt-4 md:mt-0">
              View full vehicle guide
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-xl p-6">
              <Truck className="h-8 w-8 text-brand-700 mb-4" />
              <h3 className="font-semibold text-brand-900 mb-2">Vans</h3>
              <p className="text-gray-600 text-sm mb-4">
                Small to Luton vans for parcels, pallets and light freight. Perfect for urban deliveries.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>Up to 1,200kg payload</li>
                <li>Up to 18m³ capacity</li>
                <li>Tail lift available</li>
              </ul>
            </div>
            <div className="border rounded-xl p-6">
              <Package className="h-8 w-8 text-brand-700 mb-4" />
              <h3 className="font-semibold text-brand-900 mb-2">Rigid Trucks</h3>
              <p className="text-gray-600 text-sm mb-4">
                7.5t to 26t rigids for palletised goods, machinery and bulk deliveries.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>Up to 15,000kg payload</li>
                <li>Up to 60m³ capacity</li>
                <li>Sleeper cabs for overnights</li>
              </ul>
            </div>
            <div className="border rounded-xl p-6">
              <Factory className="h-8 w-8 text-brand-700 mb-4" />
              <h3 className="font-semibold text-brand-900 mb-2">Artics</h3>
              <p className="text-gray-600 text-sm mb-4">
                44t articulated lorries for maximum capacity loads and full container equivalents.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>Up to 26,000kg payload</li>
                <li>Up to 85m³ capacity</li>
                <li>26 pallet spaces</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-8">Additional UK Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border">
              <Shield className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Goods in Transit Insurance</h3>
              <p className="text-gray-600 text-sm">
                All shipments covered up to £50,000. Additional cover available for high-value goods.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <Clock className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Timed Deliveries</h3>
              <p className="text-gray-600 text-sm">
                Pre-9am, pre-10am, pre-12 noon delivery options. AM/PM windows available.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <Package className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Tail Lift & Pallet Jack</h3>
              <p className="text-gray-600 text-sm">
                Mechanical offloading equipment available on all larger vehicles.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <MapPin className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Multi-Drop Deliveries</h3>
              <p className="text-gray-600 text-sm">
                Efficient routing for multiple delivery points on a single run.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <Truck className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Hazardous Goods (ADR)</h3>
              <p className="text-gray-600 text-sm">
                ADR-certified drivers and vehicles for dangerous goods transport.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <CheckCircle className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Proof of Delivery</h3>
              <p className="text-gray-600 text-sm">
                Electronic POD with signature capture, photos and timestamps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ship?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Get an instant quote for UK delivery or speak to our team about your requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote" className="btn btn-accent text-lg px-8 py-3">
              Get Instant Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/eu-shipping" className="btn btn-secondary text-lg px-8 py-3">
              EU Shipping Info
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
