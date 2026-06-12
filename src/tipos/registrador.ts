// src/tipos/registrador.ts
// Tipos que reflejan la forma de los datos que devuelve el backend.

export interface Parametro {
  id: number;
  nombre: string;
  unidad: string;
  indiceParametro: number;
}

export interface RelacionTransformacion {
  id: number;
  relacion: string;
}

export interface ConfigRegistrador {
  id: number;
  idParametro: number;
  idRelacionTransformacion: number | null;
  panel: 'superior' | 'inferior';
  orden: number;
  parametro: Parametro;
  relacionTransformacion: RelacionTransformacion | null;
}

export interface TituloPanel {
  id: number;
  nombre: string;
}

export interface Registrador {
  id: number;
  nombre: string;
  tipo: 'rele' | 'analizador';
  headColor: string;
  ip: string;
  puerto: number;
  indiceInicial: number;
  cantidadRegistros: number;
  periodoSegundos: number;
  panelSuperior: boolean;
  idTituloPanelSuperior: number;
  panelInferior: boolean;
  idTituloPanelInferior: number;
  activo: boolean;
  deletedAt: string | null; // soft delete: null = vivo, con fecha = eliminado
  configsRegistrador: ConfigRegistrador[];
  tituloPanelSuperior: TituloPanel;
  tituloPanelInferior: TituloPanel;
}
