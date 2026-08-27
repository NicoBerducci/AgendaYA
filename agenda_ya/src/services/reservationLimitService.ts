// @ts-ignore
import { validarLimiteDiario } from '../utils/Rules/reglasDisponibilidad';

export interface ReservationLimitResponse {
  isValid: boolean;
  errorMessage?: string;
  successMessage?: string;
  valor?: number;
  sinLimite?: boolean;
}

export const saveReservationLimit = async (limit: number | string): Promise<ReservationLimitResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const validationResult: ReservationLimitResponse = { ...validarLimiteDiario(limit) };
      if (validationResult.isValid) {
        validationResult.successMessage = "El límite máximo de reservas fue configurado exitosamente";
      }
      resolve(validationResult);
    }, 5);
  });
};
