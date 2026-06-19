import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth: boolean;
  allowIncomplete?: boolean;
}

export const ProtectedRoute: React.FC<RouteGuardProps> = ({
  children,
  requireAuth,
  allowIncomplete = false,
}) => {
  const { user, profile, loading, initialized } = useAuth();
  const location = useLocation();

  // If still loading and session isn't resolved, show premium splash loading indicator
  if (loading || !initialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-yellow-100 dark:border-yellow-950"></div>
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse font-outfit">
          Loading VibeChat...
        </p>
      </div>
    );
  }

  // --- CASE 1: ROUTE REQUIRES AUTHENTICATION ---
  if (requireAuth) {
    if (!user) {
      // User is not logged in: Redirect to login page
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is logged in: Check profile status
    const isProfileComplete = profile?.profile_completed === true;

    if (!isProfileComplete && !allowIncomplete) {
      // Profile incomplete but route requires complete profile: Redirect to complete-profile page
      return <Navigate to="/complete-profile" replace />;
    }

    if (isProfileComplete && allowIncomplete) {
      // Profile is already completed, but user is trying to access complete-profile page: Redirect to App Home
      return <Navigate to="/app/home" replace />;
    }

    // Normal access allowed
    return <>{children}</>;
  }

  // --- CASE 2: PUBLIC GUEST PAGES (Login, SignUp, ForgotPassword) ---
  if (user) {
    // Logged in user trying to access login/signup
    const isProfileComplete = profile?.profile_completed === true;
    if (!isProfileComplete) {
      return <Navigate to="/complete-profile" replace />;
    }
    return <Navigate to="/app/home" replace />;
  }

  // Normal access for guests
  return <>{children}</>;
};
