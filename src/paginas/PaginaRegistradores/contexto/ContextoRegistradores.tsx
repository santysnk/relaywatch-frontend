// src/paginas/PaginaRegistradores/contexto/ContextoRegistradores.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api } from '@/api/axios';
import type { Registrador } from '@/tipos/registrador';

interface ContextoRegistradoresValor {
  registradores: Registrador[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

const ContextoRegistradores = createContext<ContextoRegistradoresValor | null>(null);

export function ProveedorRegistradores({ children }: { children: ReactNode }) {
  const [registradores, setRegistradores] = useState<Registrador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trae (o re-trae) la lista de registradores del backend.
  // El token lo adjunta solo el interceptor de axios.
  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await api.get<Registrador[]>('/registradores');
      setRegistradores(res.data);
    } catch {
      setError('No se pudieron cargar los registradores.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Al montar el dashboard, cargamos la lista
  useEffect(() => {
    recargar();
  }, [recargar]);

  const valor: ContextoRegistradoresValor = {
    registradores,
    cargando,
    error,
    recargar,
  };

  return (
    <ContextoRegistradores.Provider value={valor}>
      {children}
    </ContextoRegistradores.Provider>
  );
}

export function usarContextoRegistradores() {
  const contexto = useContext(ContextoRegistradores);
  if (!contexto) {
    throw new Error(
      'usarContextoRegistradores debe usarse dentro de ProveedorRegistradores',
    );
  }
  return contexto;
}
