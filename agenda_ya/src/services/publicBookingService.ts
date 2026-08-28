// Simula, del lado "servidor", el estado de los horarios públicos del Módulo 4
// (M04-R02F / US_028, US_029, US_034, US_035). Es un estado en memoria compartido
// por todos los componentes que lo importen, para poder simular en la misma pantalla
// a dos usuarios invitados (dos dispositivos) operando sobre la misma agenda pública.

export type SlotStatus = 'disponible' | 'preseleccionado' | 'reservado';

export interface ClientData {
  fullName: string;
  email: string;
  phone: string;
  note?: string;
}

export interface BookingData extends ClientData {
  time: string;
  endTime: string;
  date: string;
  eventType: string;
  confirmedAt: number;
  deviceId: string;
}

export interface Slot {
  time: string;
  status: SlotStatus;
  lockedBy?: string;
  lockExpiresAt?: number;
  booking?: BookingData;
}

export interface PublicBookingState {
  date: string;
  eventType: string;
  slots: Slot[];
  reservations: BookingData[];
}

export const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutos (US_028 / US_035)

export const MORNING_SLOTS = ['10:00', '10:30', '11:00'];
export const AFTERNOON_SLOTS = ['14:00', '14:30', '15:00'];
const HORARIOS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

export const calculateEndTime = (startTime: string, durationMinutes: number = 30): string => {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  const endH = String(Math.floor(total / 60)).padStart(2, '0');
  const endM = String(total % 60).padStart(2, '0');
  return `${endH}:${endM}`;
};

const buildDefaultState = (dateStr: string = ''): PublicBookingState => ({
  date: dateStr,
  eventType: 'Consulta general',
  slots: HORARIOS.map((time) => ({ time, status: 'disponible' as SlotStatus })),
  reservations: [],
});

let state: PublicBookingState = buildDefaultState();

/** Restablece el estado (para demos y para aislar tests entre sí). */
export const resetPublicBookingState = (dateStr: string = ''): void => {
  state = buildDefaultState(dateStr);
};

const releaseExpiredLocks = (now: number): void => {
  state.slots.forEach((slot) => {
    if (slot.status === 'preseleccionado' && slot.lockExpiresAt !== undefined && slot.lockExpiresAt <= now) {
      slot.status = 'disponible';
      slot.lockedBy = undefined;
      slot.lockExpiresAt = undefined;
    }
  });
};

/** Devuelve el listado de horarios, liberando primero los bloqueos vencidos. */
export const getSlots = (): Slot[] => {
  releaseExpiredLocks(Date.now());
  return state.slots.map((slot) => ({ ...slot }));
};

export const getSlot = (time: string): Slot | undefined => {
  releaseExpiredLocks(Date.now());
  const slot = state.slots.find((s) => s.time === time);
  return slot ? { ...slot } : undefined;
};

/** Devuelve la lista de reservas confirmadas */
export const getReservations = (): BookingData[] => {
  return [...state.reservations];
};

/** Devuelve la reserva confirmada asociada a un horario */
export const getReservationForSlot = (time: string): BookingData | undefined => {
  return state.reservations.find((r) => r.time === time);
};

/**
 * Selecciona (preselecciona) un horario para un dispositivo/usuario dado.
 * Si el horario ya no está disponible (tomado por otro usuario o reservado), rechaza la operación.
 */
export const selectSlot = (
  time: string,
  deviceId: string
): { ok: boolean; message?: string; slot?: Slot } => {
  releaseExpiredLocks(Date.now());
  const slot = state.slots.find((s) => s.time === time);
  if (!slot) return { ok: false, message: 'Horario inválido' };

  if (slot.status !== 'disponible') {
    return { ok: false, message: 'El horario ya no está disponible' };
  }

  slot.status = 'preseleccionado';
  slot.lockedBy = deviceId;
  slot.lockExpiresAt = Date.now() + LOCK_DURATION_MS;

  return { ok: true, slot: { ...slot } };
};

/**
 * Confirma la reserva de un horario preseleccionado antes de que expire el tiempo.
 * (M04-R04F / US_034 - CP_013, US_035 - CP_014)
 */
export const confirmBooking = (
  time: string,
  deviceId: string,
  clientData: ClientData
): { ok: boolean; message?: string; reservation?: BookingData } => {
  releaseExpiredLocks(Date.now());
  const slot = state.slots.find((s) => s.time === time);
  if (!slot) {
    return { ok: false, message: 'Horario inválido' };
  }

  // Si ya no está preseleccionado o pertenece a otro dispositivo, expiró o no es válido
  if (slot.status !== 'preseleccionado' || slot.lockedBy !== deviceId) {
    return { ok: false, message: 'El tiempo para confirmar la reserva expiró' };
  }

  // Verificación adicional de expiración por timestamp
  if (slot.lockExpiresAt !== undefined && slot.lockExpiresAt <= Date.now()) {
    slot.status = 'disponible';
    slot.lockedBy = undefined;
    slot.lockExpiresAt = undefined;
    return { ok: false, message: 'El tiempo para confirmar la reserva expiró' };
  }

  // Reserva válida: pasa a estado "reservado"
  const endTime = calculateEndTime(time, 30);
  const reservation: BookingData = {
    ...clientData,
    time,
    endTime,
    date: state.date,
    eventType: state.eventType,
    confirmedAt: Date.now(),
    deviceId,
  };

  slot.status = 'reservado';
  slot.lockedBy = undefined;
  slot.lockExpiresAt = undefined;
  slot.booking = reservation;

  state.reservations.push(reservation);

  return { ok: true, reservation };
};

/** Fuerza la expiración del bloqueo temporal de un horario (útil para pruebas y simulación rápida). */
export const expireLock = (time: string): void => {
  const slot = state.slots.find((s) => s.time === time);
  if (slot && slot.status === 'preseleccionado') {
    slot.status = 'disponible';
    slot.lockedBy = undefined;
    slot.lockExpiresAt = undefined;
  }
};

/** Milisegundos restantes del bloqueo temporal de un horario preseleccionado. */
export const getRemainingMs = (time: string): number => {
  releaseExpiredLocks(Date.now());
  const slot = state.slots.find((s) => s.time === time);
  if (!slot || slot.status !== 'preseleccionado' || slot.lockExpiresAt === undefined) return 0;
  return Math.max(0, slot.lockExpiresAt - Date.now());
};

export const formatMinutesSeconds = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};
