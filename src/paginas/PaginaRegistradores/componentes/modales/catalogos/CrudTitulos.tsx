// src/paginas/PaginaRegistradores/componentes/modales/catalogos/CrudTitulos.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '@/api/axios';
import { ModalConfirmacion } from '@/components/ModalConfirmacion/ModalConfirmacion';
import type { TituloPanel } from '@/tipos/registrador';

// El título con id=1 ("Sin determinar") es el default del sistema: el backend
// impide editarlo o borrarlo, así que acá también lo bloqueamos.
const ID_DEFAULT = 1;

function esProtegido(item: TituloPanel) {
  return item.id === ID_DEFAULT;
}

// CRUD del catálogo "Títulos de panel".
// Tabla con scroll + selección de UNA fila por vez (clic) que carga el form.
export function CrudTitulos() {
  // --- Lista ---
  const [items, setItems] = useState<TituloPanel[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- Formulario / selección ---
  // seleccionadoId === null  -> modo ALTA (creando uno nuevo)
  // seleccionadoId === número -> esa fila está seleccionada (modo EDICIÓN)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const { data } = await api.get<TituloPanel[]>('/titulos-paneles');
      setItems(data);
    } catch {
      setError('No se pudieron cargar los títulos.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Clic en una fila -> la selecciona y la carga en el formulario.
  // Las filas protegidas (Sin determinar) no se pueden seleccionar.
  function seleccionarFila(item: TituloPanel) {
    if (esProtegido(item)) return;
    setSeleccionadoId(item.id);
    setNombre(item.nombre);
    setError(null);
  }

  // Volver a modo alta (deselecciona)
  function nuevo() {
    setSeleccionadoId(null);
    setNombre('');
    setError(null);
  }

  // Clic en el área del modal (fuera de una fila o del form) -> deselecciona.
  // Solo actúa si había algo seleccionado, para no borrar un alta en curso.
  function deseleccionar() {
    if (seleccionadoId !== null) nuevo();
  }

  // Crear (alta) o editar (PATCH) según haya fila seleccionada
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (seleccionadoId === null) {
        await api.post('/titulos-paneles', { nombre: nombre.trim() });
      } else {
        await api.patch(`/titulos-paneles/${seleccionadoId}`, { nombre: nombre.trim() });
      }
      nuevo();
      await cargar();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setError('Ya existe un título con ese nombre.');
      else setError('No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  // Elimina la fila seleccionada. La confirmación la maneja ModalConfirmacion:
  // el botón "Eliminar" solo abre el diálogo; esto corre al confirmar.
  async function confirmarEliminar() {
    if (seleccionadoId === null) return;
    setConfirmarAbierto(false);
    setError(null);
    try {
      await api.delete(`/titulos-paneles/${seleccionadoId}`);
      nuevo();
      await cargar();
    } catch {
      setError('No se pudo eliminar.');
    }
  }

  // Orden: "Sin determinar" (id=1) primero, el resto alfabético.
  const itemsOrdenados = [...items].sort((a, b) => {
    if (a.id === ID_DEFAULT) return -1;
    if (b.id === ID_DEFAULT) return 1;
    return a.nombre.localeCompare(b.nombre, 'es');
  });

  // El título seleccionado, para mostrar su nombre en el diálogo de borrado.
  const itemSeleccionado = items.find((i) => i.id === seleccionadoId);

  return (
    <>
      <div className="cat-crud" onClick={deseleccionar}>
      {/* Formulario de alta / edición. stopPropagation: clickear dentro del
          form no deselecciona la fila. */}
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div className="alim-modal-campo">
          <label>{seleccionadoId === null ? 'Nuevo título' : 'Editar título seleccionado'}</label>
          <div className="cat-input-wrap">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tensión de línea (33kV)"
              required
              maxLength={100}
            />
            {/* X: limpia el input y deselecciona la fila. Aparece solo si hay
                algo que limpiar (texto escrito o una fila seleccionada). */}
            {(nombre !== '' || seleccionadoId !== null) && (
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
            disabled={guardando || nombre.trim() === ''}
          >
            {guardando ? 'Guardando...' : seleccionadoId === null ? 'Crear' : 'Actualizar'}
          </button>
        </div>
      </form>

      {error && <p className="alim-modal-error">{error}</p>}

      {/* Tabla con scroll */}
      {cargando ? (
        <p className="cat-vacio">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="cat-vacio">No hay títulos todavía.</p>
      ) : (
        <div className="cat-tabla-scroll">
          <table className="cat-tabla">
            <thead>
              <tr>
                <th className="cat-col-num">#</th>
                <th>Título de panel</th>
              </tr>
            </thead>
            <tbody>
              {itemsOrdenados.map((item, indice) => {
                const protegido = esProtegido(item);
                return (
                  <tr
                    key={item.id}
                    className={[
                      item.id === seleccionadoId ? 'cat-fila-sel' : '',
                      protegido ? 'cat-fila-protegida' : '',
                    ]
                      .join(' ')
                      .trim()}
                    onClick={
                      protegido
                        ? undefined
                        : (e) => {
                            e.stopPropagation();
                            seleccionarFila(item);
                          }
                    }
                  >
                    <td className="cat-col-num">{indice}</td>
                    <td>
                      {item.nombre}
                      {protegido && <em className="cat-no-editable">(no editable)</em>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>

      <ModalConfirmacion
        abierto={confirmarAbierto}
        titulo="Eliminar título"
        mensaje={`¿Eliminar el título "${itemSeleccionado?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        peligroso
        onConfirmar={confirmarEliminar}
        onCancelar={() => setConfirmarAbierto(false)}
      />
    </>
  );
}
