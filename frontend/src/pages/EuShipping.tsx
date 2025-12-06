import { Link } from 'react-router-dom';
import {
  Truck,
  Clock,
  Globe,
  Package,
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  FileText,
  AlertTriangle,
  Ship,
  Plane
} from 'lucide-react';

const countries = [
  {
    region: 'Western Europe',
    destinations: [
      { country: 'France', transitTime: '1-2 days', notes: 'Daily departures, Channel Tunnel or ferry' },
      { country: 'Belgium', transitTime: '1-2 days', notes: 'Key hub for Benelux distribution' },
      { country: 'Netherlands', transitTime: '1-2 days', notes: 'Rotterdam port connections' },
      { country: 'Germany', transitTime: '2-3 days', notes: 'Full coverage including East Germany' },
      { country: 'Luxembourg', transitTime: '2 days', notes: 'Combined with Belgium runs' }
    ]
  },
  {
    region: 'Southern Europe',
    destinations: [
      { country: 'Spain', transitTime: '3-4 days', notes: 'Including Balearic Islands' },
      { country: 'Portugal', transitTime: '3-4 days', notes: 'Via Spain corridor' },
      { country: 'Italy', transitTime: '3-4 days', notes: 'North & Central Italy, Sicily available' },
      { country: 'Greece', transitTime: '5-6 days', notes: 'Via Italy ferry or overland' }
    ]
  },
  {
    region: 'Northern Europe',
    destinations: [
      { country: 'Ireland', transitTime: '1-2 days', notes: 'Direct ferry services' },
      { country: 'Denmark', transitTime: '2-3 days', notes: 'Via Germany' },
      { country: 'Sweden', transitTime: '3-4 days', notes: 'Ferry from Denmark or Germany' },
      { country: 'Norway', transitTime: '3-4 days', notes: 'Specialist routes available' },
      { country: 'Finland', transitTime: '4-5 days', notes: 'Via Sweden ferry' }
    ]
  },
  {
    region: 'Central & Eastern Europe',
    destinations: [
      { country: 'Poland', transitTime: '3-4 days', notes: 'Growing market, regular services' },
      { country: 'Czech Republic', transitTime: '3 days', notes: 'Via Germany' },
      { country: 'Austria', transitTime: '3 days', notes: 'Via Germany, mountain routes' },
      { country: 'Switzerland', transitTime: '2-3 days', notes: 'Non-EU, customs apply' },
      { country: 'Hungary', transitTime: '4 days', notes: 'Via Austria' }
    ]
  }
];

const services = [
  {
    icon: Truck,
    title: 'Full Load (FTL)',
    description: 'Dedicated vehicle for your cargo, direct to destination without transhipment.',
    features: ['Door-to-door service', 'No handling damage risk', 'Fastest transit times', 'Real-time GPS tracking']
  },
  {
    icon: Package,
    title: 'Part Load (LTL/Groupage)',
    description: 'Share vehicle space with other shipments for cost-effective European delivery.',
    features: ['Cost-effective for smaller loads', 'Regular departures', 'Hub network across Europe', 'Pallet and parcel options']
  },
  {
    icon: Clock,
    title: 'Express European',
    description: 'Time-critical shipments with guaranteed delivery windows.',
    features: ['Next-day to near Europe', '48-hour to most destinations', 'Priority handling', 'Dedicated vehicle option']
  },
  {
    icon: Globe,
    title: 'European Distribution',
    description: 'Multi-country delivery runs for businesses with pan-European customers.',
    features: ['Single pickup, multiple drops', 'Route optimisation', 'Customs consolidation', 'Regular scheduled services']
  }
];

const customsInfo = [
  {
    title: 'Export Documentation',
    items: ['Commercial Invoice', 'Packing List', 'Certificate of Origin (if required)', 'Export licence (restricted goods)']
  },
  {
    title: 'Import Requirements',
    items: ['EORI number (mandatory)', 'Commodity codes (HS codes)', 'Customs declarations', 'VAT registration (if applicable)']
  },
  {
    title: 'Prohibited/Restricted',
    items: ['Weapons and ammunition', 'Certain food products', 'Live animals (specialist only)', 'Cultural artefacts']
  }
];

const brexitChanges = [
  'EORI number required for all EU shipments',
  'Customs declarations on all goods',
  'Rules of Origin for tariff preferences',
  'Potential delays at borders during peak times',
  'Safety and Security declarations',
  'Phytosanitary certificates for plant products'
];

export default function EuShipping() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2 text-accent-400 mb-4">
              <Globe className="h-5 w-5" />
              <span className="font-medium">European Coverage</span>
            </div>
            <h1 className="text-4xl font-bold mb-6">European Road Transport</h1>
            <p className="text-xl text-gray-300 mb-8">
              Reliable road freight across the European Union and beyond. Full customs support
              post-Brexit with seamless cross-border delivery to 30+ countries.
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

      {/* Key Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">30+</div>
              <div className="text-gray-600">Countries served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">Daily</div>
              <div className="text-gray-600">EU departures</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">100%</div>
              <div className="text-gray-600">Customs handled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-900">T1/T2</div>
              <div className="text-gray-600">Transit documents</div>
            </div>
          </div>
        </div>
      </section>

      {/* Brexit Notice */}
      <section className="py-8 bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">Post-Brexit Shipping</h3>
              <p className="text-amber-700 text-sm mb-3">
                Since January 2021, customs formalities apply to all UK-EU trade. We handle all documentation
                and declarations - just provide your EORI number and commercial invoice details.
              </p>
              <div className="flex flex-wrap gap-2">
                {brexitChanges.slice(0, 4).map((change, index) => (
                  <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                    {change}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-8">European Services</h2>
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

      {/* Transit Times by Country */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-2">Transit Times by Destination</h2>
          <p className="text-gray-600 mb-8">
            Typical transit times for road freight from UK. Times may vary based on customs clearance and collection location.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {countries.map((region, index) => (
              <div key={index} className="border rounded-xl overflow-hidden">
                <div className="bg-brand-900 text-white px-4 py-3">
                  <h3 className="font-semibold">{region.region}</h3>
                </div>
                <div className="divide-y">
                  {region.destinations.map((dest, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-brand-900">{dest.country}</div>
                        <div className="text-xs text-gray-500">{dest.notes}</div>
                      </div>
                      <div className="flex items-center text-sm text-accent-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {dest.transitTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customs Documentation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-2">Customs & Documentation</h2>
          <p className="text-gray-600 mb-8">
            We handle all customs formalities. Here's what you'll need to provide:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customsInfo.map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border">
                <FileText className="h-6 w-6 text-brand-700 mb-3" />
                <h3 className="font-semibold text-brand-900 mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-brand-50 rounded-xl p-6">
            <h3 className="font-semibold text-brand-900 mb-3">Need an EORI Number?</h3>
            <p className="text-gray-600 text-sm mb-4">
              An EORI (Economic Operators Registration and Identification) number is mandatory for all UK-EU trade.
              You can apply for free through HMRC - the process typically takes 3-5 working days.
            </p>
            <a
              href="https://www.gov.uk/eori"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:text-accent-700 font-medium text-sm"
            >
              Apply for EORI on GOV.UK →
            </a>
          </div>
        </div>
      </section>

      {/* Channel Crossing Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-8">Channel Crossing Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-brand-100">
                  <Truck className="h-6 w-6 text-brand-700" />
                </div>
                <h3 className="text-lg font-semibold text-brand-900">Eurotunnel (Channel Tunnel)</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Fastest crossing at just 35 minutes. Drive-on, drive-off service with departures every 30 minutes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Folkestone to Calais
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  35-minute crossing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  24/7 operations
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Weather-proof
                </li>
              </ul>
            </div>

            <div className="border rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-brand-100">
                  <Ship className="h-6 w-6 text-brand-700" />
                </div>
                <h3 className="text-lg font-semibold text-brand-900">Ferry Services</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Multiple routes and operators. Good for accompanied and unaccompanied trailers.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Dover - Calais (90 mins)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Harwich - Hook of Holland
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Hull - Rotterdam/Zeebrugge
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Portsmouth - multiple ports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-900 mb-8">European Shipping Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border">
              <Shield className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">CMR Insurance</h3>
              <p className="text-gray-600 text-sm">
                International road freight covered under CMR Convention. Additional cover available.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <FileText className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">ATA Carnets</h3>
              <p className="text-gray-600 text-sm">
                Temporary import/export for exhibition goods and samples without paying duties.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <Plane className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Air Freight Backup</h3>
              <p className="text-gray-600 text-sm">
                Ultra-urgent? We can arrange air freight for time-critical European shipments.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <Package className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Temperature Controlled</h3>
              <p className="text-gray-600 text-sm">
                Refrigerated trailers for pharmaceuticals, food and temperature-sensitive goods.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <Truck className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">ADR Dangerous Goods</h3>
              <p className="text-gray-600 text-sm">
                Certified drivers and vehicles for hazardous materials across Europe.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border">
              <Globe className="h-6 w-6 text-brand-700 mb-3" />
              <h3 className="font-semibold text-brand-900 mb-2">Customs Bonding</h3>
              <p className="text-gray-600 text-sm">
                Transit goods through the UK or EU without paying import duties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ship to Europe Today</h2>
          <p className="text-xl text-gray-300 mb-8">
            Get an instant quote for European delivery. We handle customs, you focus on your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quote" className="btn btn-accent text-lg px-8 py-3">
              Get Instant Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/uk-shipping" className="btn btn-secondary text-lg px-8 py-3">
              UK Shipping Info
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
