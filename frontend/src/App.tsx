import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Home from './pages/Home';
import Quote from './pages/Quote';
import QuoteDetail from './pages/QuoteDetail';
import OrderDetail from './pages/OrderDetail';
import Track from './pages/Track';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Quotes from './pages/Quotes';
import Services from './pages/Services';
import Vehicles from './pages/Vehicles';
import UkShipping from './pages/UkShipping';
import EuShipping from './pages/EuShipping';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminRoutePlanner from './pages/admin/AdminRoutePlanner';
import AdminFinances from './pages/admin/AdminFinances';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHR from './pages/admin/AdminHR';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverRunSheet from './pages/driver/DriverRunSheet';
import DriverVehicleCheck from './pages/driver/DriverVehicleCheck';
import DriverEmergency from './pages/driver/DriverEmergency';
import DriverPOD from './pages/driver/DriverPOD';
import DriverProblem from './pages/driver/DriverProblem';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect drivers to driver dashboard
  if (user?.role === 'driver') {
    return <Navigate to="/driver" replace />;
  }

  // Redirect admins/dispatchers to admin dashboard
  if (user?.role === 'admin' || user?.role === 'dispatcher') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'dispatcher') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function DriverRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="quote" element={<Quote />} />
              <Route path="track" element={<Track />} />
              <Route path="services" element={<Services />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="uk-shipping" element={<UkShipping />} />
              <Route path="eu-shipping" element={<EuShipping />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="quotes"
                element={
                  <ProtectedRoute>
                    <Quotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="quotes/:id"
                element={
                  <ProtectedRoute>
                    <QuoteDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id/pay"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/orders/:id"
                element={
                  <AdminRoute>
                    <AdminOrderDetail />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/drivers"
                element={
                  <AdminRoute>
                    <AdminDrivers />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/customers"
                element={
                  <AdminRoute>
                    <AdminCustomers />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/orders/:id/route"
                element={
                  <AdminRoute>
                    <AdminRoutePlanner />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/finances"
                element={
                  <AdminRoute>
                    <AdminFinances />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/hr"
                element={
                  <AdminRoute>
                    <AdminHR />
                  </AdminRoute>
                }
              />

              {/* Driver Routes */}
              <Route
                path="driver"
                element={
                  <DriverRoute>
                    <DriverDashboard />
                  </DriverRoute>
                }
              />
              <Route
                path="driver/run-sheet/:id"
                element={
                  <DriverRoute>
                    <DriverRunSheet />
                  </DriverRoute>
                }
              />
              <Route
                path="driver/job/:id"
                element={
                  <DriverRoute>
                    <DriverRunSheet />
                  </DriverRoute>
                }
              />
              <Route
                path="driver/job/:id/pod"
                element={
                  <DriverRoute>
                    <DriverPOD />
                  </DriverRoute>
                }
              />
              <Route
                path="driver/job/:id/problem"
                element={
                  <DriverRoute>
                    <DriverProblem />
                  </DriverRoute>
                }
              />
              <Route
                path="driver/vehicle-check"
                element={
                  <DriverRoute>
                    <DriverVehicleCheck />
                  </DriverRoute>
                }
              />
              <Route
                path="driver/emergency"
                element={
                  <DriverRoute>
                    <DriverEmergency />
                  </DriverRoute>
                }
              />
            </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
