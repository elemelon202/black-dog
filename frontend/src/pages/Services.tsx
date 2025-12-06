import { Link } from 'react-router-dom';
import {
  Truck,
  Package,
  Clock,
  Globe,
  Snowflake,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  MapPin
} from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: Truck,
      title: 'Full Load (FTL)',
      description: 'Dedicated vehicle exclusively for your shipment. Ideal for large consignments that require the full capacity of a vehicle.',
      features: [
        'Exclusive use of vehicle',
        'Direct delivery - no stops',
        'Fastest transit times',
        'Ideal for sensitive goods'
      ],
      idealFor: 'Large shipments, time-sensitive deliveries, high-value goods'
    },
    {
      icon: Package,
      title: 'Part Load (LTL)',
      description: 'Share vehicle space with other shipments for cost-effective transport. Perfect for smaller consignments.',
      features: [
        'Cost-effective pricing',
        'Regular scheduled services',
        'Flexible pickup windows',
        'Suitable for palletised goods'
      ],
      idealFor: 'Smaller shipments, regular deliveries, budget-conscious shipping'
    },
    {
      icon: Clock,
      title: 'Express Delivery',
      description: 'Same-day and next-day delivery options for urgent shipments that cannot wait.',
      features: [
        'Same-day collection',
        'Guaranteed delivery times',
        'Priority handling',
        'Real-time tracking'
      ],
      idealFor: 'Urgent documents, critical parts, time-sensitive materials'
    },
    {
      icon: Globe,
      title: 'European Transport',
      description: 'Regular road freight services to all EU countries with full customs clearance support.',
      features: [
        'Coverage across 27 EU countries',
        'Full customs documentation',
        'CMR consignment notes',
        'Transit times from 1-5 days'
      ],
      idealFor: 'Export/import shipments, regular EU trade, cross-border distribution'
    },
    {
      icon: Snowflake,
      title: 'Temperature Controlled',
      description: 'Refrigerated transport for goods requiring specific temperature conditions throughout transit.',
      features: [
        'Temperature range: -25°C to +25°C',
        'Continuous temperature monitoring',
        'ATP certified vehicles',
        'HACCP compliant'
      ],
      idealFor: 'Food products, pharmaceuticals, chemicals, perishable goods'
    },
    {
      icon: AlertTriangle,
      title: 'Hazardous Goods (ADR)',
      description: 'Licensed transport of dangerous goods with fully trained drivers and certified vehicles.',
      features: [
        'ADR certified drivers',
        'Compliant vehicles',
        'All hazard classes covered',
        'Full documentation support'
      ],
      idealFor: 'Chemicals, fuels, batteries, industrial materials'
    }
  ];

  const vehicleTypes = [
    { name: 'Small Van', weight: '800kg', volume: '6m³', length: '2.4m' },
    { name: 'Large Van', weight: '1,200kg', volume: '12m³', length: '3.7m' },
    { name: 'Luton Van', weight: '1,000kg', volume: '18m³', length: '4.2m' },
    { name: '7.5 Tonne', weight: '3,500kg', volume: '30m³', length: '6.0m' },
    { name: '18 Tonne', weight: '10,000kg', volume: '45m³', length: '7.5m' },
    { name: '26 Tonne', weight: '15,000kg', volume: '60m³', length: '9.0m' },
    { name: '44 Tonne Artic', weight: '26,000kg', volume: '85m³', length: '13.6m' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-gray-300">
              From urgent same-day deliveries to regular European freight, we offer
              comprehensive road transport solutions tailored to your business needs.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent-100">
                      <Icon className="h-6 w-6 text-accent-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-brand-900">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 font-medium mb-1">IDEAL FOR</p>
                    <p className="text-sm text-brand-900">{service.idealFor}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vehicle Fleet */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-900 mb-4">Our Fleet</h2>
            <p className="text-lg text-gray-600">
              Modern vehicles to handle any shipment size
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-sm">
              <thead className="bg-brand-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left rounded-tl-xl">Vehicle Type</th>
                  <th className="px-6 py-4 text-center">Max Weight</th>
                  <th className="px-6 py-4 text-center">Max Volume</th>
                  <th className="px-6 py-4 text-center rounded-tr-xl">Load Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicleTypes.map((vehicle, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-brand-900">{vehicle.name}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{vehicle.weight}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{vehicle.volume}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{vehicle.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Coverage Map */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-brand-900 mb-6">
                UK & European Coverage
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We provide comprehensive road freight services across the UK and
                throughout Europe. Our regular services cover all major trading routes.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-brand-900 mb-2 flex items-center">
                    <MapPin className="h-5 w-5 text-accent-500 mr-2" />
                    UK Coverage
                  </h3>
                  <p className="text-gray-600">
                    Full coverage across England, Wales, Scotland, and Northern Ireland.
                    Including Scottish Highlands and Islands.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-brand-900 mb-2 flex items-center">
                    <Globe className="h-5 w-5 text-accent-500 mr-2" />
                    European Routes
                  </h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• France, Belgium, Netherlands, Germany (1-2 days)</li>
                    <li>• Spain, Portugal, Italy, Austria (2-3 days)</li>
                    <li>• Poland, Czech Republic, Denmark (3-4 days)</li>
                    <li>• Scandinavia, Eastern Europe (4-5 days)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-brand-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-brand-900 mb-6">
                European Shipping Support
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-brand-900">Full Customs Clearance</p>
                    <p className="text-sm text-gray-600">
                      We handle all post-Brexit documentation and customs requirements
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-brand-900">CMR Documentation</p>
                    <p className="text-sm text-gray-600">
                      International consignment notes for all European shipments
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-brand-900">Door-to-Door Service</p>
                    <p className="text-sm text-gray-600">
                      Collection and delivery to any address in the UK and EU
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-brand-900">Real-Time Tracking</p>
                    <p className="text-sm text-gray-600">
                      Track your shipment every step of the way
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Get an instant quote for your shipment in under a minute
          </p>
          <Link
            to="/quote"
            className="btn btn-accent text-lg px-8 py-3 inline-flex"
          >
            Get Your Quote
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
