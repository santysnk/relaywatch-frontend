// src/paginas/PaginaRegistradores/componentes/tarjetas/GrillaTarjetas.tsx
import './GrillaTarjetas.css';
import { TarjetaRegistrador } from './TarjetaRegistrador/TarjetaRegistrador';
import type { Registrador } from '@/tipos/registrador';

interface GrillaTarjetasProps {
  registradores: Registrador[];
  esAdmin: boolean;
  midiendo: boolean;
  onConfig: (registrador: Registrador) => void;
  onMapeo: (registrador: Registrador) => void;
  onNuevoRegistrador: () => void;
}

// Grilla: dibuja una tarjeta por registrador y, si sos admin, la tarjeta "+".
export function GrillaTarjetas({
  registradores,
  esAdmin,
  midiendo,
  onConfig,
  onMapeo,
  onNuevoRegistrador,
}: GrillaTarjetasProps) {
  return (
    <div className="alim-cards-grid">
      {registradores.map((r) => (
        <TarjetaRegistrador
          key={r.id}
          registrador={r}
          esAdmin={esAdmin}
          midiendo={midiendo}
          onConfig={() => onConfig(r)}
          onMapeo={() => onMapeo(r)}
        />
      ))}

      {esAdmin && (
        <div className="alim-card-add" onClick={onNuevoRegistrador}>
          <span className="alim-card-add-plus">+</span>
          <span className="alim-card-add-text">Nuevo Registrador</span>
        </div>
      )}
    </div>
  );
}
