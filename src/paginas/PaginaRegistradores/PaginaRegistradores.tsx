// src/paginas/PaginaRegistradores/PaginaRegistradores.tsx
import { ProveedorRegistradores } from './contexto/ContextoRegistradores';
import { VistaRegistradores } from './componentes/layout/VistaRegistradores';

// Página contenedora: provee los datos (contexto) y monta la vista.
export function PaginaRegistradores() {
  return (
    <ProveedorRegistradores>
      <VistaRegistradores />
    </ProveedorRegistradores>
  );
}
