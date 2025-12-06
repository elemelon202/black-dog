import { Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  Shield,
  ArrowRight,
  Globe,
  Package,
  CheckCircle
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Truck,
      title: 'Full Fleet Range',
      description: 'From small vans to 44-ton articulated lorries, we have the right vehicle for your cargo.',
    },
    {
      icon: Globe,
      title: 'UK & European Coverage',
      description: 'Nationwide UK delivery and regular services to all major European destinations.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Same-day, next-day, and scheduled delivery options to meet your timeline.',
    },
    {
      icon: Shield,
      title: 'Fully Insured',
      description: 'Comprehensive goods-in-transit insurance for complete peace of mind.',
    },
  ];

  const vehicleTypes = [
    { name: 'Small Van', capacity: 'Up to 800kg', icon: '🚐' },
    { name: 'Large Van', capacity: 'Up to 1.2 tonnes', icon: '🚚' },
    { name: '7.5 Tonne', capacity: 'Up to 3.5 tonnes', icon: '🚛' },
    { name: '18 Tonne', capacity: 'Up to 10 tonnes', icon: '🚛' },
    { name: '26 Tonne', capacity: 'Up to 15 tonnes', icon: '🚛' },
    { name: '44 Tonne Artic', capacity: 'Up to 26 tonnes', icon: '🚛' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                UK & European Road Transport You Can Rely On
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                From urgent same-day deliveries to full container loads across Europe.
                Black Dog Express delivers with speed, reliability, and competitive pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/quote"
                  className="btn btn-accent text-lg px-8 py-3"
                >
                  Get Instant Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/track"
                  className="btn btn-secondary text-lg px-8 py-3"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Track Shipment
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-brand-800 rounded-2xl p-8">
                <h2 className="text-2xl font-semibold mb-6">Quick Quote</h2>
                <QuickQuoteForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">1000+</div>
              <div className="text-gray-600">Deliveries Monthly</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">99.2%</div>
              <div className="text-gray-600">On-Time Delivery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">27</div>
              <div className="text-gray-600">EU Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-900 mb-4">
              Why Choose Black Dog Express?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine industry expertise with modern technology to deliver exceptional logistics solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-100 text-accent-600 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-900 mb-4">
              Our Fleet
            </h2>
            <p className="text-xl text-gray-600">
              The right vehicle for every job, from parcels to pallets
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {vehicleTypes.map((vehicle, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-4xl mb-3">{vehicle.icon}</div>
                <h3 className="font-semibold text-brand-900">{vehicle.name}</h3>
                <p className="text-sm text-gray-600">{vehicle.capacity}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/vehicles" className="text-accent-600 hover:text-accent-700 font-medium">
              View full vehicle specifications →
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Complete Transport Solutions
              </h2>
              <p className="text-gray-300 mb-8">
                Whether you need a single pallet delivered across town or regular
                container shipments to Europe, we have the expertise and resources
                to meet your logistics needs.
              </p>
              <ul className="space-y-4">
                {[
                  'Full Load (FTL) and Part Load (LTL)',
                  'Same-day and next-day express delivery',
                  'Temperature-controlled transport',
                  'Hazardous goods (ADR certified)',
                  'Full customs clearance for EU',
                  'Real-time tracking and notifications',
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-800 rounded-2xl p-8">
              <h3 className="text-2xl font-semibold mb-6">European Coverage</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-brand-700">
                  <span>France, Belgium, Netherlands</span>
                  <span className="text-accent-400">1-2 days</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-brand-700">
                  <span>Germany, Spain, Italy</span>
                  <span className="text-accent-400">2-3 days</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-brand-700">
                  <span>Poland, Czech Republic</span>
                  <span className="text-accent-400">3-4 days</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span>Scandinavia, Eastern Europe</span>
                  <span className="text-accent-400">4-5 days</span>
                </div>
              </div>
              <Link
                to="/shipping-info"
                className="block mt-6 text-center text-accent-400 hover:text-accent-300"
              >
                View full shipping information →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="h-16 w-16 text-accent-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-brand-900 mb-4">
            Ready to Ship?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get an instant quote for your shipment. No account required.
          </p>
          <Link
            to="/quote"
            className="btn btn-accent text-lg px-8 py-3 inline-flex"
          >
            Get Your Free Quote
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuickQuoteForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          From (Postcode)
        </label>
        <input
          type="text"
          placeholder="e.g., SW1A 1AA"
          className="input bg-brand-700 border-brand-600 text-white placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          To (Postcode)
        </label>
        <input
          type="text"
          placeholder="e.g., M1 1AA"
          className="input bg-brand-700 border-brand-600 text-white placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Weight (kg)
        </label>
        <input
          type="number"
          placeholder="e.g., 500"
          className="input bg-brand-700 border-brand-600 text-white placeholder-gray-400"
        />
      </div>
      <Link
        to="/quote"
        className="btn btn-accent w-full py-3 text-lg"
      >
        Get Detailed Quote
      </Link>
    </form>
  );
}
