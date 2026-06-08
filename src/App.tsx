import { Routes, Route, Navigate } from 'react-router-dom';
import { PaginaLogin } from '@/paginas/PaginaLogin/PaginaLogin';
import { PaginaRegistro } from '@/paginas/PaginaRegistro/PaginaRegistro';
import { PaginaRegistradores } from '@/paginas/PaginaRegistradores/PaginaRegistradores';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="/registro" element={<PaginaRegistro />} />

      {/* Privada: requiere sesión */}
      <Route
        path="/registradores"
        element={
          <ProtectedRoute>
            <PaginaRegistradores />
          </ProtectedRoute>
        }
      />

      {/* Raíz y rutas desconocidas → al dashboard
          (si no hay sesión, el ProtectedRoute rebota al login) */}
      <Route path="*" element={<Navigate to="/registradores" replace />} />
    </Routes>
  );
}

export default App;
