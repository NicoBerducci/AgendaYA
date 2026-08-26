import {
  LOCK_DURATION_MS,
  formatMinutesSeconds,
  getRemainingMs,
  getSlots,
  resetPublicBookingState,
  selectSlot,
} from './publicBookingService';

describe('publicBookingService — CP_011: Selección de horario con bloqueo temporal (Gracia Ignacio)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-02T10:00:00.000Z'));
    resetPublicBookingState('2026-09-02');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('bloquea el horario seleccionado y lo excluye para otros usuarios', () => {
    expect(getSlots().find((s) => s.time === '10:30')?.status).toBe('disponible');

    const result = selectSlot('10:30', 'device-a');
    expect(result.ok).toBe(true);
    expect(getSlots().find((s) => s.time === '10:30')?.status).toBe('preseleccionado');

    const conflict = selectSlot('10:30', 'device-b');
    expect(conflict.ok).toBe(false);
    expect(conflict.message).toBe('El horario ya no está disponible');
  });

  it('inicia el contador en 10:00 y lo decrementa con el correr del tiempo', () => {
    selectSlot('10:30', 'device-a');
    expect(formatMinutesSeconds(getRemainingMs('10:30'))).toBe('10:00');

    jest.advanceTimersByTime(60 * 1000);
    expect(formatMinutesSeconds(getRemainingMs('10:30'))).toBe('09:00');
  });

  it('libera el horario automáticamente cuando vence el bloqueo temporal de 10 minutos', () => {
    selectSlot('10:30', 'device-a');
    jest.advanceTimersByTime(LOCK_DURATION_MS + 1000);

    expect(getSlots().find((s) => s.time === '10:30')?.status).toBe('disponible');

    const result = selectSlot('10:30', 'device-b');
    expect(result.ok).toBe(true);
  });
});
