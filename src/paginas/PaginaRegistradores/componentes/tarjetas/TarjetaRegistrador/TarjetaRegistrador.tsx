// src/paginas/PaginaRegistradores/componentes/tarjetas/TarjetaRegistrador/TarjetaRegistrador.tsx
import type { CSSProperties } from 'react';
import './TarjetaRegistrador.css';
import configIcon from '@/assets/imagenes/Config_Icon.png';
import mapIcon from '@/assets/imagenes/Mapeo_icon.png';
import { usarLecturas } from '../../../hooks/usarLecturas';
import type { Registrador, ConfigRegistrador } from '@/tipos/registrador';

interface TarjetaRegistradorProps {
  registrador: Registrador;
  esAdmin: boolean;
  midiendo: boolean; // estado global de medición (viene del navbar)
  onConfig: () => void;
  onMapeo: () => void;
}

// Extrae la "fase" del nombre del parámetro: "Corriente R" -> "R"
function fase(nombre: string): string {
  const partes = nombre.trim().split(' ');
  return partes[partes.length - 1];
}

// Una caja de medición individual. Muestra el valor real o "--,--" si no hay.
function CajaMedicion({ config, valor }: { config: ConfigRegistrador; valor?: string }) {
  const display = valor != null ? Number(valor).toFixed(2) : '--,--';
  return (
    <div className="alim-card-meter">
      <span className="alim-card-meter-phase">{fase(config.parametro.nombre)}</span>
      <span className="alim-card-meter-value">{display}</span>
    </div>
  );
}

// Un panel (superior o inferior): título + sus cajas
function Panel({
  titulo,
  configs,
  valores,
}: {
  titulo: string;
  configs: ConfigRegistrador[];
  valores: Record<number, string>;
}) {
  return (
    <div className="alim-card-section">
      <h3 className="alim-card-section-title">{titulo}</h3>
      <div className="alim-card-meters">
        {configs.map((c) => (
          <CajaMedicion key={c.id} config={c} valor={valores[c.idParametro]} />
        ))}
      </div>
    </div>
  );
}

export function TarjetaRegistrador({
  registrador,
  esAdmin,
  midiendo,
  onConfig,
  onMapeo,
}: TarjetaRegistradorProps) {
  // El polling se controla con el estado global "midiendo" (botón del navbar)
  const valores = usarLecturas(registrador.id, registrador.periodoSegundos, midiendo);

  // Cada parámetro sabe en qué panel va (panel) y en qué posición (orden)
  const porOrden = (a: ConfigRegistrador, b: ConfigRegistrador) => a.orden - b.orden;
  const configsSuperior = registrador.configsRegistrador
    .filter((c) => c.panel === 'superior')
    .sort(porOrden);
  const configsInferior = registrador.configsRegistrador
    .filter((c) => c.panel === 'inferior')
    .sort(porOrden);

  return (
    <div className="alim-card">
      <div
        className="alim-card-header"
        style={{
          background: `linear-gradient(to right, ${registrador.headColor}, ${registrador.headColor}80)`,
        }}
      >
        {esAdmin && (
          <div className="alim-card-icons">
            <button
              type="button"
              className="alim-card-icon-btn"
              onClick={onConfig}
              title="Configurar registrador"
            >
              <img src={configIcon} alt="Configurar" className="alim-card-icon" />
            </button>
            <button
              type="button"
              className="alim-card-icon-btn alim-card-map-btn"
              onClick={onMapeo}
              title="Mapeo de mediciones"
            >
              <img src={mapIcon} alt="Mapeo" className="alim-card-icon" />
            </button>
          </div>
        )}
        <span className="alim-card-title">{registrador.nombre}</span>
      </div>

      {/* Barra de progreso (con "chispa"): se llena en periodo_segundos y
          reinicia. Al completarse, el polling ya trajo las últimas lecturas. */}
      {midiendo && (
        <div className="alim-card-progress-track">
          <div
            className="alim-card-progress-fill"
            style={{ '--progress-duration': `${registrador.periodoSegundos}s` } as CSSProperties}
          >
            <div className="alim-card-progress-spark" />
          </div>
        </div>
      )}

      <div className="alim-card-body">
        <Panel titulo={registrador.tituloPanelSuperior.nombre} configs={configsSuperior} valores={valores} />
        <Panel titulo={registrador.tituloPanelInferior.nombre} configs={configsInferior} valores={valores} />
      </div>
    </div>
  );
}
