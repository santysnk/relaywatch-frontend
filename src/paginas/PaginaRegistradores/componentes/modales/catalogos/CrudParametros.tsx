// src/paginas/PaginaRegistradores/componentes/modales/catalogos/CrudParametros.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '@/api/axios';
import { ModalConfirmacion } from '@/components/ModalConfirmacion/ModalConfirmacion';
import type { Parametro } from '@/tipos/registrador';

// El índice Modbus debe ser un entero >= 0 (solo dígitos).
const SOLO_DIGITOS = /^\d+$/;

// CRUD del catálogo "Parámetros". Tres campos: nombre, unidad e índice Modbus.
// La combinación (nombre + índice) es única en el backend → 409 si se repite.
export function CrudParametros() {
  // --- Lista ---
  const [items, setItems] = useState<Parametro[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- Formulario / selección ---
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('');
  const [indice, setIndice] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get<Parametro[]>('/parametros');
      setItems(data);
    } catch {
      setError('No se pudieron cargar los parámetros.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function seleccionarFila(item: Parametro) {
    setSeleccionadoId(item.id);
    setNombre(item.nombre);
    setUnidad(item.unidad);
    setIndice(String(item.indiceParametro));
    setError(null);
  }

  function nuevo() {
    setSeleccionadoId(null);
    setNombre('');
    setUnidad('');
    setIndice('');
    setError(null);
  }

  function deseleccionar() {
    if (seleccionadoId !== null) nuevo();
  }

  const datosValidos =
    nombre.trim() !== '' && unidad.trim() !== '' && SOLO_DIGITOS.test(indice.trim());
  const hayContenido =
    nombre !== '' || unidad !== '' || indice !== '' || seleccionadoId !== null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!datosValidos) return;
    const cuerpo = {
      nombre: nombre.trim(),
      unidad: unidad.trim(),
      indiceParametro: Number(indice.trim()),
    };
    setGuardando(true);
    setError(null);
    try {
      if (seleccionadoId === null) {
        await api.post('/parametros', cuerpo);
      } else {
        await api.patch(`/parametros/${seleccionadoId}`, cuerpo);
      }
      nuevo();
      await cargar();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setError('Ya existe un parámetro con ese nombre e índice.');
      else if (status === 400) setError('Revisá los datos: hay algún campo inválido.');
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
      await api.delete(`/parametros/${seleccionadoId}`);
      nuevo();
      await cargar();
    } catch (err: any) {
      // FK RESTRICT: el parámetro está en uso por algún registrador o lectura
      if (err?.response?.status === 409) {
        setError('No se puede eliminar: está en uso por algún registrador o lectura.');
      } else {
        setError('No se pudo eliminar.');
      }
    }
  }

  // Orden alfabético por nombre
  const itemsOrdenados = [...items].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', { numeric: true }),
  );

  const itemSeleccionado = items.find((i) => i.id === seleccionadoId);

  return (
    <>
      <div className="cat-crud" onClick={deseleccionar}>
        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="alim-modal-campo">
            <label>
              {seleccionadoId === null ? 'Nuevo parámetro' : 'Editar parámetro seleccionado'}
            </label>
            <div className="cat-input-wrap">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tensión R"
                required
                maxLength={50}
              />
              {hayContenido && (
                <button
                  type="button"
                  className="cat-input-x"
                  onClick={nuevo}
                  title="Limpiar y deseleccionar"
                  aria-label="Limpiar"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="alim-modal-fila">
            <div className="alim-modal-campo">
              <label>Unidad</label>
              <input
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="kV"
                required
                maxLength={10}
              />
            </div>
            <div className="alim-modal-campo">
              <label>Índice Modbus</label>
              <input
                type="number"
                min="0"
                value={indice}
                onChange={(e) => setIndice(e.target.value)}
                placeholder="152"
                required
              />
            </div>
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
          <p className="cat-vacio">No hay parámetros todavía.</p>
        ) : (
          <div className="cat-tabla-scroll">
            <table className="cat-tabla">
              <thead>
                <tr>
                  <th className="cat-col-num">#</th>
                  <th>Nombre</th>
                  <th>Unidad</th>
                  <th>Índice</th>
                </tr>
              </thead>
              <tbody>
                {itemsOrdenados.map((item, pos) => (
                  <tr
                    key={item.id}
                    className={item.id === seleccionadoId ? 'cat-fila-sel' : ''}
                    onClick={(e) => {
                      e.stopPropagation();
                      seleccionarFila(item);
                    }}
                  >
                    <td className="cat-col-num">{pos + 1}</td>
                    <td>{item.nombre}</td>
                    <td>{item.unidad}</td>
                    <td>{item.indiceParametro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalConfirmacion
        abierto={confirmarAbierto}
        titulo="Eliminar parámetro"
        mensaje={`¿Eliminar el parámetro "${itemSeleccionado?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        peligroso
        onConfirmar={confirmarEliminar}
        onCancelar={() => setConfirmarAbierto(false)}
      />
    </>
  );
}
