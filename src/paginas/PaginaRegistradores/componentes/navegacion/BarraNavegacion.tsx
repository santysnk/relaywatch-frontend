// src/paginas/PaginaRegistradores/componentes/navegacion/BarraNavegacion.tsx
import { useEffect, useRef, useState } from 'react';
import { SelectorColorFondo } from './SelectorColorFondo';
import './BarraNavegacion.css';

// Duración del viaje del spark en el botón de mediciones (desktop).
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

// Barra superior del dashboard.
// Desktop: título + mediciones (izq) y controles (der).
// Mobile (<=820px): ☰ hamburguesa (izq) · título centrado · ▶ play (der).
// El desktop/mobile lo decide el CSS (sin hooks de resize).
export function BarraNavegacion({
  esAdmin,
  midiendo,
  colorFondo,
  onToggleMediciones,
  onCambiarColorFondo,
  onCatalogos,
  onSalir,
}: BarraNavegacionProps) {
  // Animación del spark (solo en el botón de desktop)
  const [animando, setAnimando] = useState<'iniciar' | 'detener' | null>(null);
  // Menú hamburguesa (solo se usa en mobile)
  const [menuAbierto, setMenuAbierto] = useState(false);
  const timerRef = useRef<number | null>(null);

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

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="alim-navbar">
      {/* ☰ Hamburguesa — MOBILE (primera = izquierda) */}
      <button
        type="button"
        className="alim-hamburguesa"
        onClick={() => setMenuAbierto((o) => !o)}
        aria-label="Menú"
      >
        {menuAbierto ? '✕' : '☰'}
      </button>

      <div className="alim-navbar-left">
        <h1 className="alim-title">Panel de Registradores</h1>

        {/* Mediciones con spark — DESKTOP (oculto en mobile) */}
        <button
          type="button"
          className={`alim-btn-mediciones alim-nav-desktop ${
            midiendo ? 'alim-btn-mediciones-on' : ''
          } ${animando ? 'alim-btn-mediciones-animando' : ''}`}
          onClick={handleClickMediciones}
        >
          {/* El key fuerza a React a RECREAR estos nodos en cada cambio de
              estado (inmune a extensiones que reescriben el DOM, React #11538). */}
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
          {animando && <span className={`alim-spark-viaje alim-spark-${animando}`} />}
        </button>
      </div>

      {/* Acciones derecha — DESKTOP (oculto en mobile) */}
      <div className="alim-nav-buttons alim-nav-desktop">
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
          <SelectorColorFondo color={colorFondo} onCambiar={onCambiarColorFondo} />
          <button type="button" className="alim-btn-exit" onClick={onSalir}>
            Salir
          </button>
        </div>
      </div>

      {/* ▶ Play solo-ícono — MOBILE (a la derecha). Mantiene el estilo ghost del
          botón de desktop (verde / rojo), pero togglea directo (sin spark). */}
      <button
        type="button"
        className={`alim-btn-mediciones alim-play-mobile ${
          midiendo ? 'alim-btn-mediciones-on' : ''
        }`}
        onClick={onToggleMediciones}
        aria-label={midiendo ? 'Detener mediciones' : 'Iniciar mediciones'}
      >
        {midiendo ? <span key="stop">⏹</span> : <span key="play">▶</span>}
      </button>

      {/* Menú desplegable — MOBILE */}
      {menuAbierto && (
        <>
          <div className="alim-menu-backdrop" onClick={cerrarMenu} />
          <div className="alim-menu-mobile">
            <button
              type="button"
              className={`alim-menu-item ${
                midiendo ? 'alim-menu-item-detener' : 'alim-menu-item-iniciar'
              }`}
              onClick={() => {
                onToggleMediciones();
                cerrarMenu();
              }}
            >
              {midiendo ? '⏹ Detener mediciones' : '▶ Iniciar mediciones'}
            </button>

            {esAdmin && (
              <button
                type="button"
                className="alim-menu-item"
                onClick={() => {
                  onCatalogos();
                  cerrarMenu();
                }}
              >
                Catálogos
              </button>
            )}

            <div className="alim-menu-item-color">
              <span>Color de fondo</span>
              <SelectorColorFondo color={colorFondo} onCambiar={onCambiarColorFondo} />
            </div>

            <button
              type="button"
              className="alim-menu-item alim-menu-salir"
              onClick={() => {
                onSalir();
                cerrarMenu();
              }}
            >
              Salir
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
