// src/paginas/PaginaRegistradores/hooks/usarLecturas.ts
import { useEffect, useState } from 'react';
import { api } from '@/api/axios';
import type { Lectura } from '@/tipos/lectura';

// Poolea las últimas lecturas de un registrador cada `periodoSegundos`, pero
// solo cuando `activo` es true. Devuelve un mapa { idParametro: valor }.
//
// Importante: el backend (orquestador) decide cada cuánto se TOMAN las lecturas.
// Acá solo decidimos cada cuánto las CONSULTAMOS. Si el período es menor a 60s,
// vamos a traer la misma lectura repetida — está bien por ahora.
export function usarLecturas(idRegistrador: number,periodoSegundos: number, activo: boolean,): Record<number, string> {

  const [valores, setValores] = useState<Record<number, string>>({});

  useEffect(() => {
    // Si no está midiendo, limpiamos y no pooleamos
    if (!activo) {
      setValores({});
      return;
    }

    let cancelado = false;

    async function traer() {
      try {
        const res = await api.get<Lectura[]>( `/lecturas/registrador/${idRegistrador}/ultimas`,);

        if (cancelado) return;

        const mapa: Record<number, string> = {};

        res.data.forEach((l) => {
          mapa[l.idParametro] = l.valor;
        });

        setValores(mapa);

      } catch {
        // si falla una consulta, dejamos los últimos valores que teníamos
      }
    }

    traer(); // primera consulta inmediata al iniciar
	 
    const intervalo = setInterval(traer, periodoSegundos * 1000);

    // Limpieza: al detener o desmontar, cancelamos el timer
    return () => {
      cancelado = true;
      clearInterval(intervalo);
    };
  }, [idRegistrador, periodoSegundos, activo]);

  return valores;
}
