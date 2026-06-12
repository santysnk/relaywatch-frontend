// src/paginas/PaginaRegistradores/componentes/modales/mapeo/ModalMapeo.tsx
import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal/Modal';
import { api } from '@/api/axios';
import type {
  Registrador,
  ConfigRegistrador,
  Parametro,
  RelacionTransformacion,
  TituloPanel,
} from '@/tipos/registrador';
import './ModalMapeo.css';

type Panel = 'superior' | 'inferior';

// El título id=1 ("Sin determinar") es el default: va primero y en cursiva.
const ID_TITULO_DEFAULT = 1;

// Máximo de parámetros por panel: 3 entran en una fila de la card sin
// deformarla. El backend valida lo mismo (no confiamos solo en el front).
const MAX_POR_PANEL = 3;

// Borrador local de un parámetro mapeado. No guardamos 'orden': el orden es la
// posición dentro de su array (superior/inferior) y lo calculamos al guardar.
interface ConfigBorrador {
  idParametro: number;
  nombre: string;
  unidad: string;
  indice: number; // índice Modbus del parámetro
  idRelacionTransformacion: number | null;
}

function configABorrador(c: ConfigRegistrador): ConfigBorrador {
  return {
    idParametro: c.idParametro,
    nombre: c.parametro.nombre,
    unidad: c.parametro.unidad,
    indice: c.parametro.indiceParametro,
    idRelacionTransformacion: c.idRelacionTransformacion,
  };
}

interface ModalMapeoProps {
  registrador: Registrador | null; // null = cerrado
  onCerrar: () => void;
  onGuardado: () => void; // tras guardar: cierra + recarga la lista
  onIrAConfig?: () => void; // cierra el mapeo y abre la configuración del registrador
}

export function ModalMapeo({ registrador, onCerrar, onGuardado, onIrAConfig }: ModalMapeoProps) {
  const abierto = registrador !== null;

  // Pestaña activa (qué panel se está editando)
  const [panelActivo, setPanelActivo] = useState<Panel>('superior');

  // Borrador: una lista por panel
  const [superior, setSuperior] = useState<ConfigBorrador[]>([]);
  const [inferior, setInferior] = useState<ConfigBorrador[]>([]);

  // Catálogos (para los desplegables)
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [relaciones, setRelaciones] = useState<RelacionTransformacion[]>([]);
  const [titulos, setTitulos] = useState<TituloPanel[]>([]);

  // Config de cada panel (título + visibilidad)
  const [tituloSuperiorId, setTituloSuperiorId] = useState(1);
  const [tituloInferiorId, setTituloInferiorId] = useState(1);
  const [mostrarSuperior, setMostrarSuperior] = useState(true);
  const [mostrarInferior, setMostrarInferior] = useState(true);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al abrir (o cambiar de registrador): cargamos borrador + config + catálogos
  useEffect(() => {
    if (!registrador) return;
    const cfgs = registrador.configsRegistrador ?? [];
    const delPanel = (panel: Panel) =>
      cfgs
        .filter((c) => c.panel === panel)
        .sort((a, b) => a.orden - b.orden)
        .map(configABorrador);
    setSuperior(delPanel('superior'));
    setInferior(delPanel('inferior'));
    setTituloSuperiorId(registrador.idTituloPanelSuperior);
    setTituloInferiorId(registrador.idTituloPanelInferior);
    setMostrarSuperior(registrador.panelSuperior);
    setMostrarInferior(registrador.panelInferior);
    setPanelActivo('superior');
    setError(null);

    api.get<Parametro[]>('/parametros').then((r) => setParametros(r.data)).catch(() => {});
    api
      .get<RelacionTransformacion[]>('/relaciones-transformacion')
      .then((r) => setRelaciones(r.data))
      .catch(() => {});
    api.get<TituloPanel[]>('/titulos-paneles').then((r) => setTitulos(r.data)).catch(() => {});
  }, [registrador]);

  const setterDe = (panel: Panel) => (panel === 'superior' ? setSuperior : setInferior);

  function agregar(panel: Panel, idParametro: number) {
    // No pasar del tope (el select ya se deshabilita, esto es cinturón extra)
    const lista = panel === 'superior' ? superior : inferior;
    if (lista.length >= MAX_POR_PANEL) return;
    const p = parametros.find((x) => x.id === idParametro);
    if (!p) return;
    const nuevo: ConfigBorrador = {
      idParametro: p.id,
      nombre: p.nombre,
      unidad: p.unidad,
      indice: p.indiceParametro,
      idRelacionTransformacion: null,
    };
    setterDe(panel)((prev) => [...prev, nuevo]);
  }

  function quitar(panel: Panel, index: number) {
    setterDe(panel)((prev) => prev.filter((_, i) => i !== index));
  }

  function mover(panel: Panel, index: number, direccion: -1 | 1) {
    setterDe(panel)((prev) => {
      const j = index + direccion;
      if (j < 0 || j >= prev.length) return prev;
      const copia = [...prev];
      [copia[index], copia[j]] = [copia[j], copia[index]];
      return copia;
    });
  }

  function cambiarRelacion(panel: Panel, index: number, idRel: number | null) {
    setterDe(panel)((prev) =>
      prev.map((c, i) => (i === index ? { ...c, idRelacionTransformacion: idRel } : c)),
    );
  }

  async function handleGuardar() {
    if (!registrador) return;
    const configs = [
      ...superior.map((c, i) => ({
        idParametro: c.idParametro,
        idRelacionTransformacion: c.idRelacionTransformacion,
        panel: 'superior' as const,
        orden: i,
      })),
      ...inferior.map((c, i) => ({
        idParametro: c.idParametro,
        idRelacionTransformacion: c.idRelacionTransformacion,
        panel: 'inferior' as const,
        orden: i,
      })),
    ];
    setGuardando(true);
    setError(null);
    try {
      await api.patch(`/registradores/${registrador.id}`, {
        configs,
        panelSuperior: mostrarSuperior,
        idTituloPanelSuperior: tituloSuperiorId,
        panelInferior: mostrarInferior,
        idTituloPanelInferior: tituloInferiorId,
      });
      onGuardado();
    } catch {
      setError('No se pudo guardar el mapeo.');
    } finally {
      setGuardando(false);
    }
  }

  // Parámetros que todavía no están en ningún panel
  const usados = new Set([...superior, ...inferior].map((c) => c.idParametro));
  const disponibles = parametros.filter((p) => !usados.has(p.id));

  // Títulos ordenados como en el catálogo: default (id=1) primero, resto alfabético
  const titulosOrdenados = [...titulos].sort((a, b) => {
    if (a.id === ID_TITULO_DEFAULT) return -1;
    if (b.id === ID_TITULO_DEFAULT) return 1;
    return a.nombre.localeCompare(b.nombre, 'es');
  });

  // Datos del panel que está activo en la pestaña
  const esSuper = panelActivo === 'superior';
  const itemsActivo = esSuper ? superior : inferior;
  const tituloActivo = esSuper ? tituloSuperiorId : tituloInferiorId;
  const mostrarActivo = esSuper ? mostrarSuperior : mostrarInferior;
  const setMostrarActivo = esSuper ? setMostrarSuperior : setMostrarInferior;
  const setTituloActivo = esSuper ? setTituloSuperiorId : setTituloInferiorId;

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={registrador ? `Mapeo: ${registrador.nombre}` : 'Mapeo'}
    >
      {/* Pestañas: un panel por vez + check "Mostrar" del panel activo */}
      <div className="mapeo-tabs-row">
        <div className="mapeo-tabs">
          <button
            type="button"
            className={`mapeo-tab ${esSuper ? 'mapeo-tab-activa' : ''}`}
            onClick={() => setPanelActivo('superior')}
          >
            Panel superior ({superior.length}/{MAX_POR_PANEL})
          </button>
          <button
            type="button"
            className={`mapeo-tab ${!esSuper ? 'mapeo-tab-activa' : ''}`}
            onClick={() => setPanelActivo('inferior')}
          >
            Panel inferior ({inferior.length}/{MAX_POR_PANEL})
          </button>
        </div>
        <label className="mapeo-mostrar">
          <input
            type="checkbox"
            checked={mostrarActivo}
            onChange={(e) => setMostrarActivo(e.target.checked)}
          />
          Mostrar
        </label>
      </div>

      <SeccionPanel
        items={itemsActivo}
        lleno={itemsActivo.length >= MAX_POR_PANEL}
        disponibles={disponibles}
        relaciones={relaciones}
        tituloId={tituloActivo}
        titulos={titulosOrdenados}
        onAgregar={(id) => agregar(panelActivo, id)}
        onQuitar={(i) => quitar(panelActivo, i)}
        onMover={(i, dir) => mover(panelActivo, i, dir)}
        onRelacion={(i, idRel) => cambiarRelacion(panelActivo, i, idRel)}
        onCambiarTitulo={setTituloActivo}
      />

      {error && <p className="alim-modal-error">{error}</p>}

      <div className="mapeo-footer">
        {onIrAConfig && (
          <button type="button" className="mapeo-btn-config" onClick={onIrAConfig}>
            ← Configuración
          </button>
        )}
        <button
          type="button"
          className="alim-modal-btn alim-modal-btn-cancelar"
          onClick={onCerrar}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="alim-modal-btn alim-modal-btn-guardar"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </Modal>
  );
}

interface SeccionPanelProps {
  items: ConfigBorrador[];
  lleno: boolean; // el panel llegó al máximo de parámetros
  disponibles: Parametro[];
  relaciones: RelacionTransformacion[];
  tituloId: number;
  titulos: TituloPanel[];
  onAgregar: (idParametro: number) => void;
  onQuitar: (index: number) => void;
  onMover: (index: number, direccion: -1 | 1) => void;
  onRelacion: (index: number, idRelacion: number | null) => void;
  onCambiarTitulo: (idTitulo: number) => void;
}

function SeccionPanel({
  items,
  lleno,
  disponibles,
  relaciones,
  tituloId,
  titulos,
  onAgregar,
  onQuitar,
  onMover,
  onRelacion,
  onCambiarTitulo,
}: SeccionPanelProps) {
  return (
    <div className="mapeo-panel">
      <div className="mapeo-panel-config">
        <div className="mapeo-campo-inline">
          <label>Título del panel</label>
          <select value={tituloId} onChange={(e) => onCambiarTitulo(Number(e.target.value))}>
            {titulos.map((t) => (
              <option
                key={t.id}
                value={t.id}
                style={{ fontStyle: t.id === ID_TITULO_DEFAULT ? 'italic' : 'normal' }}
              >
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <select
          className="mapeo-add-select"
          value=""
          disabled={lleno || disponibles.length === 0}
          onChange={(e) => {
            const id = Number(e.target.value);
            if (id) onAgregar(id);
          }}
        >
          <option value="">{lleno ? 'Panel completo' : '+ Agregar parámetro…'}</option>
          {disponibles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.unidad}) · Modbus {p.indiceParametro}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <p className="mapeo-vacio">Sin parámetros en este panel.</p>
      ) : (
        <ul className="mapeo-lista">
          {items.map((item, index) => (
            <li key={item.idParametro} className="mapeo-fila">
              <div className="mapeo-param">
                <span className="mapeo-param-nombre">
                  {item.nombre} <span className="mapeo-unidad">({item.unidad})</span>
                </span>
                <span className="mapeo-indice">Índice Modbus: {item.indice}</span>
              </div>

              <div className="mapeo-fila-rel">
                <label>Relación</label>
                <select
                  value={item.idRelacionTransformacion ?? ''}
                  onChange={(e) =>
                    onRelacion(index, e.target.value === '' ? null : Number(e.target.value))
                  }
                >
                  <option value="">— sin —</option>
                  {relaciones.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.relacion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mapeo-acciones">
                <button
                  type="button"
                  className="mapeo-icono"
                  title="Subir"
                  disabled={index === 0}
                  onClick={() => onMover(index, -1)}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="mapeo-icono"
                  title="Bajar"
                  disabled={index === items.length - 1}
                  onClick={() => onMover(index, 1)}
                >
                  ▼
                </button>
                <button
                  type="button"
                  className="mapeo-icono mapeo-icono-borrar"
                  title="Quitar"
                  onClick={() => onQuitar(index)}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
