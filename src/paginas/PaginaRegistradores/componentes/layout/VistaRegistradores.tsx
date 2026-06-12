// src/paginas/PaginaRegistradores/componentes/layout/VistaRegistradores.tsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usarContextoRegistradores } from '../../contexto/ContextoRegistradores';
import { BarraNavegacion } from '../navegacion/BarraNavegacion';
import { GrillaTarjetas } from '../tarjetas/GrillaTarjetas';
import { Modal } from '@/components/Modal/Modal';
import { FormularioRegistrador } from '../modales/FormularioRegistrador';
import { ModalCatalogos } from '../modales/catalogos/ModalCatalogos';
import { ModalMapeo } from '../modales/mapeo/ModalMapeo';
import type { Registrador } from '@/tipos/registrador';
import './VistaRegistradores.css';

// Layout principal del dashboard.
export function VistaRegistradores() {
  
  const { usuario, logout } = useAuth();
  const { registradores, cargando, error, recargar } = usarContextoRegistradores();

  const esAdmin = usuario?.rol === 'admin';

  // Estado GLOBAL de medición: un solo botón arranca/detiene todas las tarjetas.
  const [midiendo, setMidiendo] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [catalogosAbierto, setCatalogosAbierto] = useState(false);
  const [mapeoRegistrador, setMapeoRegistrador] = useState<Registrador | null>(null);
  const [registradorEditar, setRegistradorEditar] = useState<Registrador | null>(null);

  // Color de fondo de la grilla: preferencia visual del usuario, persistida
  // en localStorage (sobrevive al refresh, es por navegador).
  const [colorFondo, setColorFondo] = useState(
    () => localStorage.getItem('rw-color-fondo') ?? '#f5f7fb',
  );

  function handleCambiarColorFondo(color: string) {
    setColorFondo(color);
    localStorage.setItem('rw-color-fondo', color);
  }

  function handleSalir() {
    logout();
  }

  function handleNuevoRegistrador() {
    setModalAbierto(true);
  }

  function handleConfig(registrador: Registrador) {
    setRegistradorEditar(registrador);
  }

  function handleMapeo(registrador: Registrador) {
    setMapeoRegistrador(registrador);
  }

  return (
    <div className="alim-page" style={{ backgroundColor: colorFondo }}>
      <BarraNavegacion
        esAdmin={esAdmin}
        midiendo={midiendo}
        colorFondo={colorFondo}
        onToggleMediciones={() => setMidiendo((m) => !m)}
        onCambiarColorFondo={handleCambiarColorFondo}
        onCatalogos={() => setCatalogosAbierto(true)}
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

      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo="Nuevo registrador"
      >
        <FormularioRegistrador
          onGuardado={() => {
            setModalAbierto(false);
            recargar();
          }}
          onCancelar={() => setModalAbierto(false)}
        />
      </Modal>

      <Modal
        abierto={registradorEditar !== null}
        onCerrar={() => setRegistradorEditar(null)}
        titulo="Editar registrador"
      >
        {registradorEditar && (
          <FormularioRegistrador
            registrador={registradorEditar}
            onGuardado={() => {
              setRegistradorEditar(null);
              recargar();
            }}
            onCancelar={() => setRegistradorEditar(null)}
            onIrAMapeo={() => {
              setMapeoRegistrador(registradorEditar);
              setRegistradorEditar(null);
            }}
          />
        )}
      </Modal>

      <ModalCatalogos
        abierto={catalogosAbierto}
        onCerrar={() => setCatalogosAbierto(false)}
      />

      <ModalMapeo
        registrador={mapeoRegistrador}
        onCerrar={() => setMapeoRegistrador(null)}
        onGuardado={() => {
          setMapeoRegistrador(null);
          recargar();
        }}
        onIrAConfig={() => {
          setRegistradorEditar(mapeoRegistrador);
          setMapeoRegistrador(null);
        }}
      />
    </div>
  );
}
