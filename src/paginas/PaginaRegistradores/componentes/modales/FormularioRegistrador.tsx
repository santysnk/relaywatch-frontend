// src/paginas/PaginaRegistradores/componentes/modales/FormularioRegistrador.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '@/api/axios';
import { ModalConfirmacion } from '@/components/ModalConfirmacion/ModalConfirmacion';
import { ModalRestaurarRegistrador } from './ModalRestaurarRegistrador';
import type { Registrador } from '@/tipos/registrador';
import './FormularioRegistrador.css';

interface FormularioRegistradorProps {
  registrador?: Registrador | null; // si viene, el formulario está en modo edición
  onGuardado: () => void; // tras crear/editar: cierra el modal + recarga la lista
  onCancelar: () => void;
  onIrAMapeo?: () => void; // solo en edición: cierra este modal y abre el de mapeo
}

export function FormularioRegistrador({
  registrador,
  onGuardado,
  onCancelar,
  onIrAMapeo,
}: FormularioRegistradorProps) {
  // Si recibimos un registrador, estamos editando; si no, creando uno nuevo.
  const esEdicion = registrador != null;

  const [nombre, setNombre] = useState(registrador?.nombre ?? '');
  const [tipo, setTipo] = useState<'rele' | 'analizador'>(registrador?.tipo ?? 'rele');
  const [ip, setIp] = useState(registrador?.ip ?? '');
  // Numéricos como string: así en alta arrancan vacíos (se ve el placeholder)
  // y en edición se cargan con el valor real.
  const [puerto, setPuerto] = useState(registrador ? String(registrador.puerto) : '');
  const [indiceInicial, setIndiceInicial] = useState(
    registrador ? String(registrador.indiceInicial) : '',
  );
  const [cantidadRegistros, setCantidadRegistros] = useState(
    registrador ? String(registrador.cantidadRegistros) : '',
  );
  // El período arranca en 60 por defecto (en edición toma el valor real).
  const [periodoSegundos, setPeriodoSegundos] = useState(
    registrador ? String(registrador.periodoSegundos) : '60',
  );
  const [headColor, setHeadColor] = useState(registrador?.headColor ?? '#4180ab');
  const [activo, setActivo] = useState(registrador?.activo ?? false);

  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [testEstado, setTestEstado] = useState<'idle' | 'probando' | 'ok' | 'error'>('idle');
  const [confirmarAbierto, setConfirmarAbierto] = useState(false);
  const [restaurarAbierto, setRestaurarAbierto] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    // No mandamos 'configs': así el mapeo (parámetros/paneles) queda intacto.
    const cuerpo = {
      nombre: nombre.trim(),
      tipo,
      ip: ip.trim(),
      puerto: Number(puerto),
      indiceInicial: Number(indiceInicial),
      cantidadRegistros: Number(cantidadRegistros),
      periodoSegundos: Number(periodoSegundos),
      headColor,
      activo,
    };
    try {
      if (registrador) {
        await api.patch(`/registradores/${registrador.id}`, cuerpo);
      } else {
        await api.post('/registradores', cuerpo);
      }
      onGuardado();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setError('Ya existe un registrador con ese nombre o IP.');
      else if (status === 403) setError('No tenés permiso (solo admin).');
      else if (status === 400) setError('Revisá los datos: hay algún campo inválido.');
      else setError('No se pudo guardar el registrador.');
    } finally {
      setGuardando(false);
    }
  }

  // Elimina el registrador (solo en edición). El backend borra en cascada
  // sus configs y lecturas. La confirmación la maneja ModalConfirmacion.
  async function confirmarEliminar() {
    if (!registrador) return;
    setConfirmarAbierto(false);
    setError(null);
    try {
      await api.delete(`/registradores/${registrador.id}`);
      onGuardado(); // cierra el modal + recarga la lista
    } catch (err: any) {
      if (err?.response?.status === 403) setError('No tenés permiso (solo admin).');
      else setError('No se pudo eliminar el registrador.');
    }
  }

  // Test de conexión (demo): simulamos el intento de conectar al equipo.
  // Regla: puerto 502 (Modbus TCP estándar) => OK; cualquier otro => error.
  function probarConexion() {
    setTestEstado('probando');
    window.setTimeout(() => {
      setTestEstado(Number(puerto) === 502 ? 'ok' : 'error');
    }, 700);
  }

  return (
    <>
    <form onSubmit={handleSubmit}>
      {/* ─── Sección 1: Identificación ─── */}
      <div className="alim-modal-fila">
        <div className="alim-modal-campo">
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="REL-02"
            required
            maxLength={45}
          />
        </div>
        <div className="alim-modal-campo">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as 'rele' | 'analizador')}>
            <option value="rele">Relé</option>
            <option value="analizador">Analizador</option>
          </select>
        </div>
      </div>

      <hr className="form-divisor" />

      {/* ─── Sección 2: Conexión ─── */}
      <div className="alim-modal-fila">
        <div className="alim-modal-campo">
          <label>IP</label>
          <input
            value={ip}
            onChange={(e) => {
              setIp(e.target.value);
              setTestEstado('idle');
            }}
            placeholder="192.168.1.11"
            required
            maxLength={45}
          />
        </div>
        <div className="alim-modal-campo">
          <label>Puerto</label>
          <input
            type="number"
            value={puerto}
            onChange={(e) => {
              setPuerto(e.target.value);
              setTestEstado('idle');
            }}
            min={1}
            placeholder="502"
            required
          />
        </div>
      </div>

      <div className="form-test-conexion">
        <button
          type="button"
          className="form-test-btn"
          onClick={probarConexion}
          disabled={testEstado === 'probando' || !ip.trim() || puerto.trim() === ''}
        >
          {testEstado === 'probando' ? 'Probando…' : 'Probar conexión'}
        </button>
        {testEstado === 'ok' && <span className="test-ok">✓ Conectado</span>}
        {testEstado === 'error' && <span className="test-error">✗ Sin respuesta</span>}
      </div>

      <hr className="form-divisor" />

      {/* ─── Sección 3: Configuración de lectura ─── */}
      <div className="alim-modal-fila">
        <div className="alim-modal-campo">
          <label>Índice inicial</label>
          <input
            type="number"
            value={indiceInicial}
            onChange={(e) => setIndiceInicial(e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div className="alim-modal-campo">
          <label>Cantidad de registros</label>
          <input
            type="number"
            value={cantidadRegistros}
            onChange={(e) => setCantidadRegistros(e.target.value)}
            min={1}
            placeholder="100"
            required
          />
        </div>
      </div>

      <div className="alim-modal-fila">
        <div className="alim-modal-campo">
          <label>Período (segundos)</label>
          <input
            type="number"
            value={periodoSegundos}
            onChange={(e) => setPeriodoSegundos(e.target.value)}
            min={1}
            placeholder="60"
            required
          />
        </div>
        <div className="alim-modal-campo">
          <label>Color del header</label>
          <input type="color" value={headColor} onChange={(e) => setHeadColor(e.target.value)} />
        </div>
      </div>

      <div className="form-fila-activo">
        <div className="alim-modal-campo alim-modal-campo-check">
          <input
            type="checkbox"
            id="activo"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          <label htmlFor="activo">Activo</label>
        </div>
        {esEdicion && onIrAMapeo && (
          <button type="button" className="form-btn-mapeo" onClick={onIrAMapeo}>
            Mapeo →
          </button>
        )}
      </div>

      {error && <p className="alim-modal-error">{error}</p>}

      <div className="alim-modal-actions">
        {esEdicion && (
          <button
            type="button"
            className="alim-modal-btn form-btn-eliminar"
            onClick={() => setConfirmarAbierto(true)}
          >
            Eliminar
          </button>
        )}
        {!esEdicion && (
          <button
            type="button"
            className="alim-modal-btn form-btn-restaurar"
            onClick={() => setRestaurarAbierto(true)}
          >
            Restaurar…
          </button>
        )}
        <button
          type="button"
          className="alim-modal-btn alim-modal-btn-cancelar"
          onClick={onCancelar}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="alim-modal-btn alim-modal-btn-guardar"
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear'}
        </button>
      </div>
    </form>

    <ModalConfirmacion
      abierto={confirmarAbierto}
      titulo="Eliminar registrador"
      mensaje={`¿Eliminar el registrador "${registrador?.nombre ?? ''}"? Dejará de verse en el panel, pero sus lecturas históricas se conservan en la base de datos.`}
      textoConfirmar="Eliminar"
      textoCancelar="Cancelar"
      peligroso
      onConfirmar={confirmarEliminar}
      onCancelar={() => setConfirmarAbierto(false)}
    />

    <ModalRestaurarRegistrador
      abierto={restaurarAbierto}
      onCerrar={() => setRestaurarAbierto(false)}
      onRestaurado={() => {
        setRestaurarAbierto(false);
        onGuardado(); // cierra el modal de alta + recarga la grilla
      }}
    />
    </>
  );
}
