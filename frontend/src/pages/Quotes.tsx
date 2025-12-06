import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { quotesApi } from '../lib/api';
import { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function Quotes() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['quotes', statusFilter],
    queryFn: async () => {
      const response = await quotesApi.getAll();
      return response.data;
    },
  });

  const quotes = data?.data || [];

  const filteredQuotes = quotes.filter((quote: { attributes: { quote_number: string; status: string } }) => {
    let matches = true;

    if (statusFilter) {
      matches = matches && quote.attributes.status === statusFilter;
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      matches = matches && quote.attributes.quote_number.toLowerCase().includes(search);
    }

    return matches;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      converted: 'bg-indigo-100 text-indigo-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  const statusOptions = [
    { value: '', label: 'All Quotes' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
    { value: 'converted', label: 'Converted' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">My Quotes</h1>
          <p className="text-gray-600">View and manage your shipping quotes</p>
        </div>
        <Link to="/quote" className="btn btn-accent">
          New Quote
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by quote number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quotes List */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading quotes...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">No quotes found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter
              ? 'Try adjusting your search or filters'
              : "You haven't requested any quotes yet"}
          </p>
          <Link to="/quote" className="btn btn-accent">
            Get Your First Quote
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote: {
            id: string;
            attributes: {
              quote_number: string;
              status: string;
              pickup_postcode: string;
              delivery_postcode: string;
              pickup_country: string;
              delivery_country: string;
              cargo_weight_kg: number;
              total_price: number;
              valid_until: string;
              expired: boolean;
              domestic: boolean;
              created_at: string;
            }
          }) => (
            <Link key={quote.id} to={`/quotes/${quote.id}`} className="card block hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-brand-900">
                      {quote.attributes.quote_number}
                    </h3>
                    {getStatusBadge(quote.attributes.status)}
                    {quote.attributes.domestic ? (
                      <span className="text-xs text-gray-500">UK Domestic</span>
                    ) : (
                      <span className="text-xs text-blue-600">International</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                    <div>
                      <span className="text-gray-500">Route:</span>{' '}
                      <span className="text-brand-900">
                        {quote.attributes.pickup_postcode} ({quote.attributes.pickup_country})
                        → {quote.attributes.delivery_postcode} ({quote.attributes.delivery_country})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Weight:</span>{' '}
                      <span className="text-brand-900">{quote.attributes.cargo_weight_kg} kg</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        Valid until:{' '}
                        {quote.attributes.valid_until
                          ? new Date(quote.attributes.valid_until).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-brand-900">
                    £{Number(quote.attributes.total_price || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">inc. VAT</p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                {quote.attributes.status === 'pending' && !quote.attributes.expired && (
                  <p className="text-sm text-yellow-600">Awaiting your decision</p>
                )}
                {quote.attributes.status === 'accepted' && (
                  <p className="text-sm text-green-600">Ready to convert to order</p>
                )}
                {quote.attributes.status === 'converted' && (
                  <p className="text-sm text-indigo-600">Converted to order</p>
                )}
                {quote.attributes.expired && quote.attributes.status === 'pending' && (
                  <p className="text-sm text-red-600">Quote expired</p>
                )}
                {quote.attributes.status === 'rejected' && (
                  <p className="text-sm text-gray-500">Declined</p>
                )}
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
