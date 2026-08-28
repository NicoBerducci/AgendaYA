// @ts-ignore
import { blockDayWithoutReservations, deleteIntervalWithoutReservations } from '../utils/blocks/blocks';

export interface IntervalItem {
  id: number;
  dia: string;
  turno: string;
  horario: string;
  activeReservations: number;
  enabled?: boolean;
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
      enabled: true,
    },
    {
      id: 2,
      dia: 'Martes',
      turno: 'Turno 1',
      horario: '08:00 a 12:00',
      activeReservations: 0,
      enabled: false,
    },
    {
      id: 3,
      dia: 'Miércoles',
      turno: 'Turno 1',
      horario: '08:00 a 12:00',
      activeReservations: 0,
      enabled: true,
    },
    {
      id: 4,
      dia: 'Miércoles',
      turno: 'Turno 2',
      horario: '14:00 a 18:00',
      activeReservations: 0,
      enabled: true,
    },
  ],
  blockedDays: {
    // Día de prueba inyectado para simular reservas activas y testear el error de bloqueo
    '2026-09-02': {
      date: '2026-09-02',
      status: 'Disponible',
      activeReservations: 5,
      isPublicSelectable: true,
    }
  },
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
 * Obtiene los días laborales configurados.
 */
export const getWorkDays = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...currentState.workDays]);
    }, 5);
  });
};

/**
 * Guarda los días y los intervalos desde la pantalla de configuración.
 */
export const saveWorkDaysAndIntervals = async (workDays: string[], intervals: IntervalItem[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentState.workDays = [...workDays];
      currentState.intervals = [...intervals];
      resolve(true);
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

/**
 * Habilita o deshabilita un intervalo temporalmente.
 */
export const toggleIntervalStatus = async (
  intervalId: number,
  enabled: boolean
): Promise<{ isValid: boolean; errorMessage?: string; successMessage?: string; intervals: IntervalItem[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const intervalIndex = currentState.intervals.findIndex((i) => i.id === intervalId);
      if (intervalIndex === -1) {
        resolve({ isValid: false, errorMessage: 'Intervalo no encontrado', intervals: currentState.intervals });
        return;
      }

      const interval = currentState.intervals[intervalIndex];

      // Si se intenta deshabilitar, verificar que no sea el último activo del día (M02-R03F)
      if (!enabled) {
        const activosDelDia = currentState.intervals.filter(
          (i) => i.dia === interval.dia && i.enabled !== false
        );
        if (activosDelDia.length <= 1) {
          resolve({
            isValid: false,
            errorMessage: 'No se puede deshabilitar el único intervalo activo del día',
            intervals: [...currentState.intervals],
          });
          return;
        }
      }

      // Aplicar el cambio de forma inmutable
      const updatedInterval = { ...interval, enabled };
      currentState.intervals = [
        ...currentState.intervals.slice(0, intervalIndex),
        updatedInterval,
        ...currentState.intervals.slice(intervalIndex + 1),
      ];

      const accion = enabled ? 'habilitó' : 'deshabilitó';
      resolve({
        isValid: true,
        successMessage: `Se ${accion} el intervalo del turno ${interval.turno} del día ${interval.dia} exitosamente`,
        intervals: [...currentState.intervals],
      });
    }, 5);
  });
};
