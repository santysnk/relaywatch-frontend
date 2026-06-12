// src/paginas/PaginaRegistradores/componentes/navegacion/SelectorColorFondo.tsx
import { useState } from 'react';
import './SelectorColorFondo.css';

// Paleta curada para el fondo de la grilla: claros arriba, oscuros abajo.
const COLORES_PRESET = [
  '#f5f7fb', // gris claro (default)
  '#e2e8f0',
  '#cbd5e1',
  '#94a3b8',
  '#28374e', // azul del tema
  '#1e293b',
  '#0f172a',
  '#18181b',
];

interface SelectorColorFondoProps {
  color: string;
  onCambiar: (color: string) => void;
}

// Botón 🎨 del navbar que despliega una mini-paleta de colores para el fondo
// de la grilla. Incluye un swatch "arcoíris" que abre el selector nativo
// para elegir un color personalizado.
export function SelectorColorFondo({ color, onCambiar }: SelectorColorFondoProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="scf">
      <button
        type="button"
        className="scf-boton"
        title="Color de fondo de la grilla"
        onClick={() => setAbierto((a) => !a)}
      >
        🎨
      </button>

      {abierto && (
        <>
          {/* Capa invisible: clic fuera del menú lo cierra */}
          <div className="scf-backdrop" onClick={() => setAbierto(false)} />

          <div className="scf-menu">
            <span className="scf-titulo">Fondo de la grilla</span>
            <div className="scf-grilla">
              {COLORES_PRESET.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`scf-swatch ${c === color ? 'scf-swatch-activo' : ''}`}
                  style={{ backgroundColor: c }}
                  title={c}
                  onClick={() => {
                    onCambiar(c);
                    setAbierto(false);
                  }}
                />
              ))}

              {/* Personalizado: el input nativo disfrazado de swatch arcoíris */}
              <label className="scf-swatch scf-swatch-custom" title="Personalizado…">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onCambiar(e.target.value)}
                />
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
