// src/paginas/PaginaRegistradores/componentes/navegacion/BarraNavegacion.tsx
import './BarraNavegacion.css';

interface BarraNavegacionProps {
  esAdmin: boolean; // solo el admin ve el botón "nuevo registrador"
  midiendo: boolean; // estado global de medición
  onToggleMediciones: () => void;
  onNuevoRegistrador: () => void;
  onCatalogos: () => void; // abre el modal de catálogos (solo admin)
  onSalir: () => void;
}

// Barra superior del dashboard. Es presentacional: recibe callbacks y los
// dispara, sin saber la lógica interna.
export function BarraNavegacion({
  esAdmin,
  midiendo,
  onToggleMediciones,
  onNuevoRegistrador,
  onCatalogos,
  onSalir,
}: BarraNavegacionProps) {
  return (
    <nav className="alim-navbar">
      <div className="alim-navbar-left">
        <h1 className="alim-title">Panel de Registradores</h1>
      </div>

      <div className="alim-nav-buttons">
        <div className="alim-nav-bloque-controles">
          {/* Botón global: arranca/detiene las mediciones de TODAS las tarjetas */}
          <button
            type="button"
            onClick={onToggleMediciones}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'white',
              backgroundColor: midiendo ? '#b91c1c' : '#176414',
            }}
          >
            {midiendo ? 'Detener mediciones' : 'Iniciar mediciones'}
          </button>

          {esAdmin && (
            <button
              type="button"
              onClick={onCatalogos}
              title="Administrar catálogos (títulos, relaciones, parámetros)"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'white',
                backgroundColor: '#475569',
              }}
            >
              Catálogos
            </button>
          )}

          {esAdmin && (
            <button
              type="button"
              className="alim-btn alim-btn-add"
              onClick={onNuevoRegistrador}
              title="Nuevo registrador"
            >
              <span className="alim-btn-add-icon">+</span>
            </button>
          )}

          <button type="button" className="alim-btn-exit" onClick={onSalir}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
