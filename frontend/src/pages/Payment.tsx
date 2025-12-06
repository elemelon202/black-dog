import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ordersApi, paymentsApi } from '../lib/api';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

function CheckoutForm({ orderId, amount }: { orderId: number; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?payment=success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-brand-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 mb-6">
          Your payment has been processed. Redirecting to your order...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount to pay</span>
          <span className="text-2xl font-bold text-brand-900">
            £{amount.toFixed(2)}
          </span>
        </div>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn btn-accent w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Lock className="h-5 w-5 mr-2" />
            Pay £{amount.toFixed(2)}
          </span>
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        <Lock className="h-4 w-4 inline mr-1" />
        Secured by Stripe. Your payment information is encrypted.
      </p>
    </form>
  );
}

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await ordersApi.getOne(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const order = orderData?.data?.attributes || orderData?.attributes || orderData;
  const amount = Number(order?.total_amount || 0);

  useEffect(() => {
    if (id && order && !order.paid) {
      paymentsApi
        .createIntent(Number(id))
        .then((response) => {
          setClientSecret(response.data.client_secret);
        })
        .catch((err) => {
          console.error('Failed to create payment intent:', err);
          setPaymentError(
            err.response?.data?.errors?.[0] ||
              err.response?.data?.error ||
              'Failed to initialize payment. Please try again.'
          );
        });
    }
  }, [id, order]);

  if (orderLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">
            Order not found
          </h3>
          <p className="text-gray-500 mb-6">
            The order you're trying to pay for doesn't exist.
          </p>
          <Link to="/orders" className="btn btn-accent">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (order.paid) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="card text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-900 mb-2">
            Already Paid
          </h3>
          <p className="text-gray-500 mb-6">
            This order has already been paid for.
          </p>
          <Link to={`/orders/${id}`} className="btn btn-accent">
            View Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/orders/${id}`)}
        className="flex items-center text-gray-600 hover:text-brand-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Order
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-brand-900 mb-2">
          Complete Payment
        </h1>
        <p className="text-gray-600 mb-6">
          Order: {order.order_number}
        </p>

        {paymentError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Payment Error
            </h3>
            <p className="text-red-700 mb-4">{paymentError}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              Try Again
            </button>
          </div>
        ) : !clientSecret ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900 mx-auto"></div>
            <p className="text-gray-500 mt-4">Initializing payment...</p>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#1e3a5f',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <CheckoutForm orderId={Number(id)} amount={amount} />
          </Elements>
        )}
      </div>
    </div>
  );
}
