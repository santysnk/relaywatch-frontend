// src/paginas/PaginaRegistradores/componentes/layout/VistaRegistradores.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usarContextoRegistradores } from '../../contexto/ContextoRegistradores';
import { BarraNavegacion } from '../navegacion/BarraNavegacion';
import { GrillaTarjetas } from '../tarjetas/GrillaTarjetas';
import type { Registrador } from '@/tipos/registrador';
import './VistaRegistradores.css';

// Layout principal del dashboard.
export function VistaRegistradores() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { registradores, cargando, error } = usarContextoRegistradores();

  const esAdmin = usuario?.rol === 'admin';

  // Estado GLOBAL de medición: un solo botón arranca/detiene todas las tarjetas.
  const [midiendo, setMidiendo] = useState(false);

  function handleSalir() {
    logout();
    navigate('/login');
  }

  function handleNuevoRegistrador() {
    // TODO (paso 4.6): abrir el modal de creación de registrador
    alert('Crear registrador — lo conectamos en el paso 4.6');
  }

  function handleConfig(registrador: Registrador) {
    // TODO (paso 4.6): abrir el modal de configuración del registrador
    alert(`Configurar "${registrador.nombre}" — lo conectamos en el paso 4.6`);
  }

  function handleMapeo(registrador: Registrador) {
    // TODO (paso 4.6): abrir el modal de mapeo de mediciones
    alert(`Mapeo de "${registrador.nombre}" — lo conectamos en el paso 4.6`);
  }

  return (
    <div className="alim-page">
      <BarraNavegacion
        esAdmin={esAdmin}
        midiendo={midiendo}
        onToggleMediciones={() => setMidiendo((m) => !m)}
        onNuevoRegistrador={handleNuevoRegistrador}
        onSalir={handleSalir}
      />

      <main className="alim-main">
        {cargando && <p>Cargando registradores...</p>}
        {error && <p style={{ color: 'salmon' }}>{error}</p>}

        {!cargando && !error && registradores.length === 0 && !esAdmin && (
          <div className="alim-empty-state">
            <p className="alim-empty">No hay registradores todavía.</p>
          </div>
        )}

        {!cargando && !error && (registradores.length > 0 || esAdmin) && (
          <GrillaTarjetas
            registradores={registradores}
            esAdmin={esAdmin}
            midiendo={midiendo}
            onConfig={handleConfig}
            onMapeo={handleMapeo}
            onNuevoRegistrador={handleNuevoRegistrador}
          />
        )}
      </main>
    </div>
  );
}
