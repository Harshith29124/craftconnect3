import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkBackendHealth } from '../services/api';

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [healthStatus, setHealthStatus] = useState(null);
  const [showHealthAlert, setShowHealthAlert] = useState(false);

  // Check backend health on app load
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkBackendHealth();
        setHealthStatus(health);
        if (!health.success) {
          setShowHealthAlert(true);
          setTimeout(() => setShowHealthAlert(false), 5000);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        setShowHealthAlert(true);
      }
    };
    
    checkHealth();
  }, []);

  const handleLogoClick = () => {
    navigate('/');
  };

  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col">
      {/* Health Alert */}
      {showHealthAlert && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 text-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Backend connection issue - some features may be limited
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-[#f4f2f0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 text-[#ec6d13]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor" />
                </svg>
              </div>
              <h1 className="text-[#181411] text-xl font-bold leading-tight">CraftConnect</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isHomePage
                    ? 'bg-[#fef3e9] text-[#ec6d13]'
                    : 'text-[#897261] hover:text-[#ec6d13] hover:bg-[#fef3e9]'
                }`}
              >
                Home
              </button>
              
              <button
                onClick={() => navigate('/business-overview')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname.includes('business')
                    ? 'bg-[#fef3e9] text-[#ec6d13]'
                    : 'text-[#897261] hover:text-[#ec6d13] hover:bg-[#fef3e9]'
                }`}
              >
                Start Analysis
              </button>
              
              <button
                onClick={() => navigate('/enhancer')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname.includes('enhancer')
                    ? 'bg-[#fef3e9] text-[#ec6d13]'
                    : 'text-[#897261] hover:text-[#ec6d13] hover:bg-[#fef3e9]'
                }`}
              >
                Enhance
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Health indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  healthStatus?.success ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <span className="text-xs text-[#897261] hidden sm:inline">
                  {healthStatus?.success ? 'Connected' : 'Limited'}
                </span>
              </div>
              
              {/* Help button */}
              <button
                className="p-2 text-[#897261] hover:text-[#ec6d13] hover:bg-[#fef3e9] rounded-full transition-colors"
                title="Help & Support"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#f4f2f0] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#897261]">
              <span>&copy; 2025 CraftConnect</span>
              <span className="hidden sm:inline">•</span>
              <span>Empowering artisans with AI</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-[#897261]">
              <button className="hover:text-[#ec6d13] transition-colors">
                Privacy
              </button>
              <button className="hover:text-[#ec6d13] transition-colors">
                Terms
              </button>
              <button className="hover:text-[#ec6d13] transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;