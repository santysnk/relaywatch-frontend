// src/paginas/PaginaRegistradores/componentes/navegacion/BarraNavegacion.tsx
import { useEffect, useRef, useState } from 'react';
import { SelectorColorFondo } from './SelectorColorFondo';
import './BarraNavegacion.css';

// Duración del viaje del spark en el botón de mediciones.
// OJO: tiene que coincidir con la duración de la animación en el CSS.
const DURACION_SPARK_MS = 1100;

interface BarraNavegacionProps {
  esAdmin: boolean; // solo el admin ve el botón de catálogos
  midiendo: boolean; // estado global de medición
  colorFondo: string; // color de fondo de la grilla
  onToggleMediciones: () => void;
  onCambiarColorFondo: (color: string) => void;
  onCatalogos: () => void; // abre el modal de catálogos (solo admin)
  onSalir: () => void;
}

// Barra superior del dashboard. Es presentacional: recibe callbacks y los
// dispara, sin saber la lógica interna.
export function BarraNavegacion({
  esAdmin,
  midiendo,
  colorFondo,
  onToggleMediciones,
  onCambiarColorFondo,
  onCatalogos,
  onSalir,
}: BarraNavegacionProps) {
  // Animación del spark: null = quieto, 'iniciar'/'detener' = viajando.
  // El toggle real de mediciones se dispara recién cuando el spark LLEGA.
  const [animando, setAnimando] = useState<'iniciar' | 'detener' | null>(null);
  const timerRef = useRef<number | null>(null);

  // Limpieza: si el componente se desmonta a mitad de viaje, matamos el timer
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function handleClickMediciones() {
    if (animando) return; // ya hay un spark viajando: ignorar el clic
    setAnimando(midiendo ? 'detener' : 'iniciar');
    timerRef.current = window.setTimeout(() => {
      setAnimando(null);
      onToggleMediciones(); // el spark llegó: ahora sí arrancan/paran
    }, DURACION_SPARK_MS);
  }

  return (
    <nav className="alim-navbar">
      <div className="alim-navbar-left">
        <h1 className="alim-title">Panel de Registradores</h1>

        {/* Botón global: arranca/detiene las mediciones de TODAS las tarjetas.
            Cuando está midiendo, muestra un puntito pulsante estilo "REC". */}
        <button
          type="button"
          className={`alim-btn-mediciones ${midiendo ? 'alim-btn-mediciones-on' : ''} ${
            animando ? 'alim-btn-mediciones-animando' : ''
          }`}
          onClick={handleClickMediciones}
        >
          {/* El key fuerza a React a RECREAR estos nodos en cada cambio de
              estado. Sin él, React reutiliza el nodo de texto y, si una
              extensión del navegador lo reemplazó (traductores, etc.), el
              texto queda congelado aunque el estado cambie (React #11538). */}
          {midiendo ? (
            <span key="detener" className="alim-btn-mediciones-contenido">
              <span className="alim-dot-rec" />
              Detener mediciones
            </span>
          ) : (
            <span key="iniciar" className="alim-btn-mediciones-contenido">
              <span className="alim-ico-play">▶</span>
              Iniciar mediciones
            </span>
          )}

          {/* El spark que viaja por el botón al hacer clic */}
          {animando && <span className={`alim-spark-viaje alim-spark-${animando}`} />}
        </button>
      </div>

      <div className="alim-nav-buttons">
        <div className="alim-nav-bloque-controles">
          {esAdmin && (
            <button
              type="button"
              className="alim-btn-catalogos"
              onClick={onCatalogos}
              title="Administrar catálogos (títulos, relaciones, parámetros)"
            >
              Catálogos
            </button>
          )}

          {/* Selector de color de fondo de la grilla */}
          <SelectorColorFondo color={colorFondo} onCambiar={onCambiarColorFondo} />

          <button type="button" className="alim-btn-exit" onClick={onSalir}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
