// src/components/Spinner/Spinner.tsx
import './Spinner.css';

interface SpinnerProps {
  tamanio?: number; // diámetro en px
}

// Anillo giratorio reutilizable. Toma el color del texto del contenedor
// (currentColor), así se adapta solo: blanco en botones, gris en páginas.
export function Spinner({ tamanio = 20 }: SpinnerProps) {
  return (
    <span
      className="spinner"
      style={{ width: tamanio, height: tamanio }}
      role="status"
      aria-label="Cargando"
    />
  );
}
