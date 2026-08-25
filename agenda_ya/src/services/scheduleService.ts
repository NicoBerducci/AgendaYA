// @ts-ignore
import { blockDayWithoutReservations, deleteIntervalWithoutReservations } from '../utils/blocks/blocks';

export interface IntervalItem {
  id: number;
  dia: string;
  turno: string;
  horario: string;
  activeReservations: number;
}

export interface ReservationItem {
  id: number;
  intervalId: number;
  fecha: string;
  estado: string;
}

export interface DayItem {
  date: string;
  status: 'Disponible' | 'Bloqueado';
  activeReservations: number;
  blockReason?: string;
  isPublicSelectable?: boolean;
}

export interface ScheduleState {
  workDays: string[];
  intervals: IntervalItem[];
  blockedDays: Record<string, DayItem>;
  reservations: ReservationItem[];
}

const defaultState: ScheduleState = {
  workDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  intervals: [
    {
      id: 1,
      dia: 'Lunes',
      turno: 'Turno 1',
      horario: '08:00 a 12:00',
      activeReservations: 3,
    },
    {
      id: 2,
      dia: 'Martes',
      turno: 'Turno 1',
      horario: '08:00 a 12:00',
      activeReservations: 0,
    },
  ],
  blockedDays: {},
  reservations: [
    { id: 101, intervalId: 1, fecha: 'F+7', estado: 'confirmada' },
    { id: 102, intervalId: 1, fecha: 'F+14', estado: 'confirmada' },
    { id: 103, intervalId: 1, fecha: 'F+21', estado: 'confirmada' },
  ],
};

let currentState: ScheduleState = JSON.parse(JSON.stringify(defaultState));

/**
 * Restablece o aplica una semilla al estado del servicio (para pruebas aisladas).
 */
export const resetScheduleState = (customSeed?: Partial<ScheduleState>): void => {
  currentState = {
    ...JSON.parse(JSON.stringify(defaultState)),
    ...JSON.parse(JSON.stringify(customSeed || {})),
  };
};

/**
 * Obtiene el estado de un día específico.
 */
export const getDayStatus = async (dateStr: string): Promise<DayItem> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existing = currentState.blockedDays[dateStr];
      if (existing) {
        resolve(existing);
      } else {
        resolve({
          date: dateStr,
          status: 'Disponible',
          activeReservations: 0,
          isPublicSelectable: true,
        });
      }
    }, 5);
  });
};

/**
 * Aplica el bloqueo de un día sin reservas previas utilizando blockDayWithoutReservations.
 */
export const blockDay = async (
  dateStr: string,
  hasConfirmed: boolean,
  currentDate: Date = new Date(),
  reason: string = ''
): Promise<{ isValid: boolean; errorMessage?: string; successMessage?: string; day?: DayItem }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingDay = currentState.blockedDays[dateStr] || {
        date: dateStr,
        status: 'Disponible',
        activeReservations: 0,
        isPublicSelectable: true,
      };

      const result = blockDayWithoutReservations(existingDay, currentDate, hasConfirmed);

      if (result.isValid && result.day) {
        const updatedDay: DayItem = {
          ...result.day,
          status: 'Bloqueado',
          blockReason: reason,
          isPublicSelectable: false,
        };
        currentState.blockedDays[dateStr] = updatedDay;

        resolve({
          isValid: true,
          successMessage: `Los siguientes días fueron bloqueados exitosamente: ${dateStr}`,
          day: updatedDay,
        });
      } else {
        resolve({
          isValid: false,
          errorMessage: result.errorMessage || 'No se pudo bloquear el día',
          day: existingDay,
        });
      }
    }, 5);
  });
};

/**
 * Obtiene los intervalos de trabajo configurados.
 */
export const getIntervals = async (): Promise<IntervalItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...currentState.intervals]);
    }, 5);
  });
};

/**
 * Elimina un intervalo si no tiene reservas activas.
 * Si tiene reservas activas, rechaza y retorna mensaje interpolado exacto.
 */
export const deleteInterval = async (
  intervalId: number,
  hasConfirmed: boolean
): Promise<{ isValid: boolean; errorMessage?: string; successMessage?: string; intervals: IntervalItem[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const interval = currentState.intervals.find((i) => i.id === intervalId);
      const activeReservations = interval ? interval.activeReservations : 0;

      const validation = deleteIntervalWithoutReservations(
        currentState.intervals,
        intervalId,
        hasConfirmed,
        activeReservations
      );

      if (!validation.isValid) {
        let errorMsg = validation.errorMessage;
        if (activeReservations > 0) {
          errorMsg = `No se puede eliminar el intervalo porque tiene ${activeReservations} reservas activas`;
        }
        resolve({
          isValid: false,
          errorMessage: errorMsg,
          intervals: [...currentState.intervals],
        });
      } else {
        currentState.intervals = validation.intervals;
        resolve({
          isValid: true,
          successMessage: 'El intervalo fue eliminado exitosamente',
          intervals: [...currentState.intervals],
        });
      }
    }, 5);
  });
};

/**
 * Obtiene el listado de reservas asociadas.
 */
export const getReservations = async (): Promise<ReservationItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...currentState.reservations]);
    }, 5);
  });
};
