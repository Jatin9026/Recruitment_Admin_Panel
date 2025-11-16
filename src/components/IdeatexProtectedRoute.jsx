import { Navigate, useLocation } from 'react-router-dom';
import { useIdeatexAuthStore } from '../store/ideatexAuthStore';

const IdeatexProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useIdeatexAuthStore();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with the current location as state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default IdeatexProtectedRoute;
