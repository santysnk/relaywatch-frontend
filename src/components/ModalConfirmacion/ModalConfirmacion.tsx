// src/components/ModalConfirmacion/ModalConfirmacion.tsx
// Modal de confirmación reutilizable (estilo oscuro del proyecto avanzado).
// Reemplaza al window.confirm nativo: se muestra un mensaje y dos botones.
import './ModalConfirmacion.css';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirmar: () => void;
  onCancelar?: () => void;
  peligroso?: boolean; // true -> botón confirmar en rojo (acciones destructivas)
  soloConfirmar?: boolean; // true -> oculta el botón Cancelar (diálogo de un solo botón, ej. "Aceptar")
}

export function ModalConfirmacion({
  abierto,
  titulo = 'Confirmar acción',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirmar,
  onCancelar,
  peligroso = false,
  soloConfirmar = false,
}: ModalConfirmacionProps) {
  if (!abierto) return null;

  return (
    <div className="confirmacion-fondo-oscuro">
      <div className="confirmacion-contenedor">
        <h2>{titulo}</h2>
        <p className="confirmacion-mensaje">{mensaje}</p>

        <div className="confirmacion-acciones">
          {!soloConfirmar && (
            <button
              type="button"
              className="confirmacion-boton confirmacion-cancelar"
              onClick={onCancelar}
            >
              {textoCancelar}
            </button>
          )}
          <button
            type="button"
            className={`confirmacion-boton ${
              peligroso ? 'confirmacion-peligro' : 'confirmacion-confirmar'
            }`}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
