import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { driverApi } from '../../lib/api';
import {
  ArrowLeft,
  CheckCircle,
  PenTool,
  Trash2,
  Save,
  Package,
  User,
  AlertCircle
} from 'lucide-react';

export default function DriverPOD() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [driverNotes, setDriverNotes] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: runSheet, isLoading } = useQuery({
    queryKey: ['driver', 'runsheet', id],
    queryFn: async () => {
      const response = await driverApi.getRunSheet(Number(id));
      return response.data;
    },
  });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    return canvas.toDataURL('image/png');
  };

  const deliverMutation = useMutation({
    mutationFn: async () => {
      const signatureData = getSignatureData();
      return driverApi.updateStatus(Number(id), 'delivered', {
        driver_notes: driverNotes,
        signature_data: signatureData,
        signature_name: signatureName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver'] });
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSignature || !signatureName.trim()) {
      return;
    }
    deliverMutation.mutate();
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card bg-green-50 border-green-200 text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Delivery Complete!</h2>
          <p className="text-green-700 mb-6">
            POD recorded successfully. Great job!
          </p>
          <button
            onClick={() => navigate('/driver')}
            className="btn btn-accent w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const delivery = runSheet?.delivery;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/driver/run-sheet/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-brand-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Run Sheet
        </Link>
        <h1 className="text-2xl font-bold text-brand-900 flex items-center">
          <PenTool className="h-6 w-6 mr-2" />
          Proof of Delivery
        </h1>
      </div>

      {/* Delivery Summary */}
      <div className="card bg-blue-50 border-blue-200 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Delivery To
        </h2>
        <div>
          {delivery?.company && <p className="font-semibold text-brand-900">{delivery.company}</p>}
          <p className="text-gray-700">{delivery?.address_line1}</p>
          <p className="text-gray-700">{delivery?.city}, {delivery?.postcode}</p>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <User className="h-4 w-4 mr-1" />
            {delivery?.contact_name || 'N/A'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Signature Pad */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-900">Customer Signature</h2>
            <button
              type="button"
              onClick={clearSignature}
              className="btn btn-sm btn-secondary"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>

          <div className="border-2 border-gray-300 rounded-lg overflow-hidden mb-4 bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-48 touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <p className="text-sm text-gray-500 text-center mb-4">
            {hasSignature ? 'Signature captured' : 'Please sign above'}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Print Name
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="input"
              placeholder="Customer's full name"
              required
            />
          </div>
        </div>

        {/* Driver Notes */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-brand-900 mb-3">Driver Notes</h2>
          <textarea
            value={driverNotes}
            onChange={(e) => setDriverNotes(e.target.value)}
            className="input min-h-[80px]"
            placeholder="Any notes about the delivery (optional)..."
          />
        </div>

        {/* Validation Message */}
        {(!hasSignature || !signatureName.trim()) && (
          <div className="card bg-yellow-50 border-yellow-200 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                {!hasSignature && !signatureName.trim()
                  ? 'Please get the customer to sign and print their name'
                  : !hasSignature
                  ? 'Please get the customer to sign'
                  : 'Please enter the customer\'s name'}
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={deliverMutation.isPending || !hasSignature || !signatureName.trim()}
          className="btn btn-accent w-full py-4 text-lg disabled:opacity-50"
        >
          <Save className="h-5 w-5 mr-2" />
          {deliverMutation.isPending ? 'Completing...' : 'Complete Delivery'}
        </button>

        {deliverMutation.isError && (
          <p className="text-red-600 text-center mt-4">
            Failed to complete delivery. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
