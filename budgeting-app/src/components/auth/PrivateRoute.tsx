import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from './LoginModal';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      <Navigate to={location.pathname} replace state={{ from: location }} />
    </>
  );
};

export default PrivateRoute; 