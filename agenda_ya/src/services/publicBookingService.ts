// Simula, del lado "servidor", el estado de los horarios públicos del Módulo 4
// (M04-R02F / US_028, US_029). Es un estado en memoria compartido por todos los
// componentes que lo importen, para poder simular en la misma pantalla a dos
// usuarios invitados (dos dispositivos) operando sobre la misma agenda pública.

export type SlotStatus = 'disponible' | 'preseleccionado' | 'reservado';

export interface Slot {
  time: string;
  status: SlotStatus;
  lockedBy?: string;
  lockExpiresAt?: number;
}

export interface PublicBookingState {
  date: string;
  eventType: string;
  slots: Slot[];
}

export const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutos (US_028)

const HORARIOS = ['10:00', '10:30', '11:00', '11:30'];

const buildDefaultState = (): PublicBookingState => ({
  date: '',
  eventType: 'Consulta general',
  slots: HORARIOS.map((time) => ({ time, status: 'disponible' as SlotStatus })),
});

let state: PublicBookingState = buildDefaultState();

/** Restablece el estado (para demos y para aislar tests entre sí). */
export const resetPublicBookingState = (dateStr: string = ''): void => {
  state = { ...buildDefaultState(), date: dateStr };
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

/**
 * Selecciona (preselecciona) un horario para un dispositivo/usuario dado.
 * Si el horario ya no está disponible (tomado por otro usuario), rechaza la operación.
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
