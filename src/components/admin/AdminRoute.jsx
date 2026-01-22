import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Lista de emails de administradores (solo el owner puede acceder)
const ADMIN_EMAILS = [
  'falcondaniel37@gmail.com', // Owner - Admin principal
];

export const useIsAdmin = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return { isAdmin: false, loading: true };

  // Verificar por email o por rol en profile
  const isAdminByEmail = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const isAdminByRole = profile?.role === 'admin';

  return {
    isAdmin: isAdminByEmail || isAdminByRole,
    loading: false
  };
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default AdminRoute;
