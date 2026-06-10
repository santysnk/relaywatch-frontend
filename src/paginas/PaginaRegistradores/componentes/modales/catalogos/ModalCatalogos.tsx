// src/paginas/PaginaRegistradores/componentes/modales/catalogos/ModalCatalogos.tsx
import { useState, useRef, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '@/components/Modal/Modal';
import { CrudTitulos } from './CrudTitulos';
import { CrudRelaciones } from './CrudRelaciones';
import { CrudParametros } from './CrudParametros';
import './Catalogos.css';

type Pestania = 'titulos' | 'relaciones' | 'parametros';

interface ModalCatalogosProps {
  abierto: boolean;
  onCerrar: () => void;
}

// Modal "Catálogos": un solo punto de entrada con 3 pestañas.
// Cambiar de pestaña es solo un useState; cada pestaña monta su propio CRUD.
export function ModalCatalogos({ abierto, onCerrar }: ModalCatalogosProps) {
  const [pestania, setPestania] = useState<Pestania>('titulos');

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Catálogos">
      <div className="cat-tabs">
        <button
          type="button"
          className={`cat-tab ${pestania === 'titulos' ? 'cat-tab-activa' : ''}`}
          onClick={() => setPestania('titulos')}
        >
          Títulos
        </button>
        <button
          type="button"
          className={`cat-tab ${pestania === 'relaciones' ? 'cat-tab-activa' : ''}`}
          onClick={() => setPestania('relaciones')}
        >
          Relaciones
        </button>
        <button
          type="button"
          className={`cat-tab ${pestania === 'parametros' ? 'cat-tab-activa' : ''}`}
          onClick={() => setPestania('parametros')}
        >
          Parámetros
        </button>
      </div>

      <ContenidoAnimado>
        {pestania === 'titulos' && <CrudTitulos />}
        {pestania === 'relaciones' && <CrudRelaciones />}
        {pestania === 'parametros' && <CrudParametros />}
      </ContenidoAnimado>
    </Modal>
  );
}

// Envuelve el contenido y anima su ALTO cuando cambia (al cambiar de tab o
// cuando llega data async). No se puede animar height:auto directamente, así
// que medimos el alto real del contenido con un ResizeObserver y se lo pasamos
// al wrapper, que tiene transition de height.
function ContenidoAnimado({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [altura, setAltura] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const medir = () => setAltura(el.scrollHeight);
    medir(); // medición inicial
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cat-contenido-animado" style={{ height: altura }}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
