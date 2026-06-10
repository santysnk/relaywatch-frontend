// src/components/Modal/Modal.tsx
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  children: ReactNode;
}

// Modal reutilizable: overlay a pantalla completa + caja centrada.
// Se cierra con la X o con Esc. NO se cierra al clickear afuera (para no
// perder lo que estés cargando por un click errado).
export function Modal({ abierto, onCerrar, titulo, children }: ModalProps) {
  // Cerrar con la tecla Esc (solo mientras está abierto)
  useEffect(() => {
    if (!abierto) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCerrar();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    // Limpieza: sacamos el listener al cerrar o desmontar
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [abierto, onCerrar]);

  // Si no está abierto, no renderiza nada
  if (!abierto) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="alim-modal">
        <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>
        {titulo && <h2>{titulo}</h2>}
        {children}
      </div>
    </div>
  );
}
