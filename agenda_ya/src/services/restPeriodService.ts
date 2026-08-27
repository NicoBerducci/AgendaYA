// @ts-ignore
import { configureRestPeriod } from '../utils/Rules/reglasDisponibilidad';

let inMemoryRestPeriod = 0;

export interface RestPeriodResponse {
  isValid: boolean;
  errorMessage?: string;
  successMessage?: string;
  valor?: number;
}

/**
 * Obtiene de forma asíncrona el valor de descanso global configurado.
 */
export const getRestPeriod = async (): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(inMemoryRestPeriod);
    }, 5);
  });
};

/**
 * Guarda de forma asíncrona el nuevo valor de descanso entre reservas si es válido.
 */
export const saveRestPeriod = async (minutes: number | string): Promise<RestPeriodResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const validationResult = configureRestPeriod(minutes);
      if (validationResult.isValid && validationResult.valor !== undefined) {
        inMemoryRestPeriod = validationResult.valor;
      }
      resolve(validationResult);
    }, 5);
  });
};

/**
 * Restablece o preconfigura directamente el valor en memoria (semilla/seed para pruebas aisladas).
 */
export const resetRestPeriod = (initialValue: number = 0): void => {
  inMemoryRestPeriod = initialValue;
};
