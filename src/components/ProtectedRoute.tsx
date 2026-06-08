import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

// Envuelve una página privada. Decide si dejar pasar según la sesión.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();

  // Mientras restaura la sesión (al refrescar), esperamos sin decidir
  if (cargando) {
    return <p>Cargando...</p>;
  }

  // Sin sesión → al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Con sesión → muestra la página protegida
  return <>{children}</>;
}
