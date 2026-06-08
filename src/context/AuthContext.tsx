import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../api/axios';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'invitado';
}

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al montar la app: si hay token guardado, restauramos la sesión
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCargando(false);
      return;
    }
    api
      .get('/usuarios/me')
      .then((res) => setUsuario(res.data))
      .catch(() => localStorage.removeItem('token')) // token vencido/inválido
      .finally(() => setCargando(false));
  }, []);

  // Login: pide el token al backend, lo guarda y setea el usuario
  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.access_token);
    setUsuario(res.data.usuario);
  }

  // Logout: limpia todo
  function logout() {
    localStorage.removeItem('token');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto cómodo desde cualquier componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}