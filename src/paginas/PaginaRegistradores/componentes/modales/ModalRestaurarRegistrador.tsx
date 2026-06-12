// src/paginas/PaginaRegistradores/componentes/modales/ModalRestaurarRegistrador.tsx
import { useEffect, useState } from 'react';
import { api } from '@/api/axios';
import { Spinner } from '@/components/Spinner/Spinner';
import type { Registrador } from '@/tipos/registrador';
import './ModalRestaurarRegistrador.css';

interface ModalRestaurarRegistradorProps {
  abierto: boolean;
  onCerrar: () => void;
  onRestaurado: () => void; // tras restaurar: cierra todo + recarga la lista
}

// Mini-modal (flota sobre el modal de registrador) con la lista de
// registradores eliminados lógicamente. Cada fila tiene su botón Restaurar.
export function ModalRestaurarRegistrador({
  abierto,
  onCerrar,
  onRestaurado,
}: ModalRestaurarRegistradorProps) {
  const [eliminados, setEliminados] = useState<Registrador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [restaurandoId, setRestaurandoId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que se abre, traemos la lista fresca de eliminados
  useEffect(() => {
    if (!abierto) return;
    setCargando(true);
    setError(null);
    api
      .get<Registrador[]>('/registradores/eliminados')
      .then((r) => setEliminados(r.data))
      .catch(() => setError('No se pudieron cargar los eliminados.'))
      .finally(() => setCargando(false));
  }, [abierto]);

  async function restaurar(reg: Registrador) {
    setRestaurandoId(reg.id);
    setError(null);
    try {
      await api.patch(`/registradores/${reg.id}/restaurar`);
      onRestaurado();
    } catch {
      setError(`No se pudo restaurar "${reg.nombre}".`);
    } finally {
      setRestaurandoId(null);
    }
  }

  if (!abierto) return null;

  return (
    <div className="restaurar-fondo-oscuro">
      <div className="restaurar-contenedor">
        <button className="restaurar-cerrar" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>
        <h2>Restaurar registrador</h2>

        {cargando ? (
          <p className="restaurar-vacio"><Spinner tamanio={24} /></p>
        ) : eliminados.length === 0 ? (
          <p className="restaurar-vacio">No hay registradores eliminados.</p>
        ) : (
          <ul className="restaurar-lista">
            {eliminados.map((reg) => (
              <li key={reg.id} className="restaurar-fila">
                <div className="restaurar-info">
                  <span className="restaurar-nombre">{reg.nombre}</span>
                  <span className="restaurar-fecha">
                    Eliminado: {reg.deletedAt ? new Date(reg.deletedAt).toLocaleString('es-AR') : '—'}
                  </span>
                </div>
                <button
                  type="button"
                  className="restaurar-btn"
                  disabled={restaurandoId !== null}
                  onClick={() => restaurar(reg)}
                >
                  {restaurandoId === reg.id ? 'Restaurando…' : 'Restaurar'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="restaurar-error">{error}</p>}
      </div>
    </div>
  );
}
