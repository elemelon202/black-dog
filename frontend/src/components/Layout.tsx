import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Truck,
  Package,
  FileText,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Calculator,
  Globe
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Get Quote', href: '/quote', icon: Calculator },
    { name: 'Track Shipment', href: '/track', icon: MapPin },
    { name: 'Services', href: '/services', icon: Globe },
  ];

  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Quotes', href: '/quotes', icon: FileText },
    { name: 'My Orders', href: '/orders', icon: Package },
    { name: 'New Quote', href: '/quote', icon: Calculator },
  ];

  const navItems = isAuthenticated ? authenticatedNavigation : navigation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-900 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-accent-500" />
              <span className="text-xl font-bold">Black Dog Express</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-800 text-white'
                        : 'text-gray-300 hover:bg-brand-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-white"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user?.first_name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-300 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-accent-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-600"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-brand-800">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-brand-800">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-3 py-2 text-gray-300 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="block px-3 py-2 text-accent-400 hover:text-accent-300"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="h-6 w-6 text-accent-500" />
                <span className="font-bold">Black Dog Express</span>
              </div>
              <p className="text-gray-400 text-sm">
                Reliable UK & European road transport solutions. From vans to 44-ton artics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/services" className="hover:text-white">Full Load (FTL)</Link></li>
                <li><Link to="/services" className="hover:text-white">Part Load (LTL)</Link></li>
                <li><Link to="/services" className="hover:text-white">Express Delivery</Link></li>
                <li><Link to="/services" className="hover:text-white">European Transport</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Information</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/shipping-info" className="hover:text-white">UK Shipping</Link></li>
                <li><Link to="/shipping-info" className="hover:text-white">EU Shipping</Link></li>
                <li><Link to="/vehicles" className="hover:text-white">Vehicle Guide</Link></li>
                <li><Link to="/track" className="hover:text-white">Track Shipment</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>0800 XXX XXXX</li>
                <li>info@blackdogexpress.co.uk</li>
                <li>United Kingdom</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-brand-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Black Dog Express Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
