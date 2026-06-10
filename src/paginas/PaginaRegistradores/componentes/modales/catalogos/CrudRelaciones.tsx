// src/paginas/PaginaRegistradores/componentes/modales/catalogos/CrudRelaciones.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '@/api/axios';
import { ModalConfirmacion } from '@/components/ModalConfirmacion/ModalConfirmacion';
import type { RelacionTransformacion } from '@/tipos/registrador';

// Cada lado de la relación debe ser un entero (solo dígitos). El backend
// después guarda "entrada/salida" (ej. 13800/110).
const SOLO_DIGITOS = /^\d+$/;

// CRUD del catálogo "Relaciones de transformación".
// En vez de un solo input "13800/110", usamos dos campos (Entrada y Salida)
// y armamos la relación uniéndolos con "/".
export function CrudRelaciones() {
  // --- Lista ---
  const [items, setItems] = useState<RelacionTransformacion[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- Formulario / selección ---
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get<RelacionTransformacion[]>('/relaciones-transformacion');
      setItems(data);
    } catch {
      setError('No se pudieron cargar las relaciones.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Al seleccionar, separamos "entrada/salida" en los dos inputs
  function seleccionarFila(item: RelacionTransformacion) {
    const [ent, sal] = item.relacion.split('/');
    setSeleccionadoId(item.id);
    setEntrada(ent ?? '');
    setSalida(sal ?? '');
    setError(null);
  }

  function nuevo() {
    setSeleccionadoId(null);
    setEntrada('');
    setSalida('');
    setError(null);
  }

  function deseleccionar() {
    if (seleccionadoId !== null) nuevo();
  }

  // Válido si ambos lados son enteros
  const datosValidos = SOLO_DIGITOS.test(entrada.trim()) && SOLO_DIGITOS.test(salida.trim());
  // ¿Hay algo escrito o una fila seleccionada? (para mostrar la X)
  const hayContenido = entrada !== '' || salida !== '' || seleccionadoId !== null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!datosValidos) return;
    const relacion = `${entrada.trim()}/${salida.trim()}`;
    setGuardando(true);
    setError(null);
    try {
      if (seleccionadoId === null) {
        await api.post('/relaciones-transformacion', { relacion });
      } else {
        await api.patch(`/relaciones-transformacion/${seleccionadoId}`, { relacion });
      }
      nuevo();
      await cargar();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400) setError('Datos inválidos. Entrada y salida deben ser enteros.');
      else setError('No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    if (seleccionadoId === null) return;
    setConfirmarAbierto(false);
    setError(null);
    try {
      await api.delete(`/relaciones-transformacion/${seleccionadoId}`);
      nuevo();
      await cargar();
    } catch {
      setError('No se pudo eliminar.');
    }
  }

  // Orden por la relación (numeric: trata los números como números)
  const itemsOrdenados = [...items].sort((a, b) =>
    a.relacion.localeCompare(b.relacion, 'es', { numeric: true }),
  );

  const itemSeleccionado = items.find((i) => i.id === seleccionadoId);

  return (
    <>
      <div className="cat-crud" onClick={deseleccionar}>
        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="alim-modal-campo">
            <label>
              {seleccionadoId === null ? 'Nueva relación' : 'Editar relación seleccionada'}
            </label>

            <div className="cat-relacion-fila">
              <div className="cat-relacion-col">
                <span className="cat-relacion-label">Entrada</span>
                <input
                  type="number"
                  min="0"
                  value={entrada}
                  onChange={(e) => setEntrada(e.target.value)}
                  placeholder="13800"
                  required
                />
              </div>

              <span className="cat-relacion-sep">/</span>

              <div className="cat-relacion-col">
                <span className="cat-relacion-label">Salida</span>
                <input
                  type="number"
                  min="0"
                  value={salida}
                  onChange={(e) => setSalida(e.target.value)}
                  placeholder="110"
                  required
                />
              </div>

              {hayContenido && (
                <button
                  type="button"
                  className="cat-relacion-x"
                  onClick={nuevo}
                  title="Limpiar y deseleccionar"
                  aria-label="Limpiar"
                >
                  ×
                </button>
              )}
            </div>

            <small className="cat-hint">Se guarda como entrada/salida (ej. 13800/110)</small>
          </div>

          <div className="cat-form-actions">
            {seleccionadoId !== null && (
              <button
                type="button"
                className="alim-modal-btn cat-btn-eliminar"
                onClick={() => setConfirmarAbierto(true)}
              >
                Eliminar
              </button>
            )}
            <button
              type="submit"
              className="alim-modal-btn alim-modal-btn-guardar"
              disabled={guardando || !datosValidos}
            >
              {guardando ? 'Guardando...' : seleccionadoId === null ? 'Crear' : 'Actualizar'}
            </button>
          </div>
        </form>

        {error && <p className="alim-modal-error">{error}</p>}

        {cargando ? (
          <p className="cat-vacio">Cargando...</p>
        ) : items.length === 0 ? (
          <p className="cat-vacio">No hay relaciones todavía.</p>
        ) : (
          <div className="cat-tabla-scroll">
            <table className="cat-tabla">
              <thead>
                <tr>
                  <th className="cat-col-num">#</th>
                  <th>Relación (entrada/salida)</th>
                </tr>
              </thead>
              <tbody>
                {itemsOrdenados.map((item, indice) => (
                  <tr
                    key={item.id}
                    className={item.id === seleccionadoId ? 'cat-fila-sel' : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      seleccionarFila(item);
                    }}
                  >
                    <td className="cat-col-num">{indice + 1}</td>
                    <td>{item.relacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalConfirmacion
        abierto={confirmarAbierto}
        titulo="Eliminar relación"
        mensaje={`¿Eliminar la relación "${itemSeleccionado?.relacion ?? ''}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        peligroso
        onConfirmar={confirmarEliminar}
        onCancelar={() => setConfirmarAbierto(false)}
      />
    </>
  );
}
