import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/Spinner/Spinner';

// Envuelve una página privada. Decide si dejar pasar según la sesión.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();

  // Mientras restaura la sesión (al refrescar), esperamos sin decidir.
  // Pantalla completa oscura con el spinner centrado.
  if (cargando) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.8rem',
          backgroundColor: '#0f172a',
          color: '#64748b',
        }}
      >
        <Spinner tamanio={34} />
        <span>Restaurando sesión…</span>
      </div>
    );
  }

  // Sin sesión → al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Con sesión → muestra la página protegida
  return <>{children}</>;
}
