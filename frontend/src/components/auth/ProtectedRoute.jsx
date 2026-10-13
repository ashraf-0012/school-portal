import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ allowedRole, children }) {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex-center flex-col gap-4">
        <div className="school-crest school-crest-lg animate-pulse">
          <span style={{ fontSize: '1.25rem' }}>★</span>
        </div>
        <p className="text-muted" style={{ fontWeight: 600 }}>Verifying session permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect to the dashboard appropriate to their verified role
    return <Navigate to={`/${userRole}`} replace />;
  }

  return children;
}
