// src/tipos/lectura.ts
import type { Parametro } from './registrador';

// Una lectura tal como la devuelve GET /lecturas/registrador/:id/ultimas
export interface Lectura {
  id: string; // bigint → llega como string
  idRegistrador: number;
  idParametro: number;
  valor: string; // decimal → llega como string
  createdAt: string;
  parametro: Parametro;
}
