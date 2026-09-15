import {
  LOCK_DURATION_MS,
  formatMinutesSeconds,
  getRemainingMs,
  getSlots,
  getSlot,
  getReservations,
  resetPublicBookingState,
  selectSlot,
  confirmBooking,
  expireLock,
} from './publicBookingService';

describe('publicBookingService — Módulo 4: Reserva Pública', () => {
  const TEST_DATE = '2026-09-02';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-02T10:00:00.000Z'));
    resetPublicBookingState(TEST_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('CP_011: Selección de horario con bloqueo temporal (Gracia Ignacio)', () => {
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

  describe('CP_013: Confirmación exitosa de reserva (Tomás Yanardi)', () => {
    it('registra la reserva antes de que expire el contador, dejando el horario en estado "reservado"', () => {
      // 1. Preseleccionar 10:30 en device-a
      selectSlot('10:30', 'device-a');
      expect(getSlot('10:30')?.status).toBe('preseleccionado');

      // 2. Confirmar con datos válidos antes de que expire el tiempo
      const clientData = {
        fullName: 'Tomás Yanardi',
        email: 'tomas.yanardi@gmail.com',
        phone: '2604123456',
        note: '',
      };

      const result = confirmBooking('10:30', 'device-a', clientData);
      expect(result.ok).toBe(true);
      expect(result.reservation).toBeDefined();
      expect(result.reservation?.fullName).toBe('Tomás Yanardi');
      expect(result.reservation?.email).toBe('tomas.yanardi@gmail.com');
      expect(result.reservation?.time).toBe('10:30');
      expect(result.reservation?.endTime).toBe('11:00');
      expect(result.reservation?.eventType).toBe('Consulta general');

      // 3. Verificar estado en base de datos
      const slot = getSlot('10:30');
      expect(slot?.status).toBe('reservado');
      expect(slot?.booking?.fullName).toBe('Tomás Yanardi');

      const allReservations = getReservations();
      expect(allReservations).toHaveLength(1);
      expect(allReservations[0].fullName).toBe('Tomás Yanardi');

      // 4. Verificar que el horario ya no está disponible para otro dispositivo
      const conflict = selectSlot('10:30', 'device-b');
      expect(conflict.ok).toBe(false);
      expect(conflict.message).toBe('El horario ya no está disponible');
    });
  });

  describe('CP_014: Rechazo de confirmación por vencimiento del bloqueo temporal (Tomás Yanardi)', () => {
    it('rechaza la confirmación cuando el tiempo de 10 minutos expira y libera el turno a "disponible"', () => {
      // 1. Preseleccionar 10:30 en device-a
      selectSlot('10:30', 'device-a');
      expect(getSlot('10:30')?.status).toBe('preseleccionado');

      // 2. Dejar pasar más de 10 minutos
      jest.advanceTimersByTime(LOCK_DURATION_MS + 1000);

      // 3. Intentar confirmar
      const clientData = {
        fullName: 'Tomás Yanardi',
        email: 'tomas.yanardi@gmail.com',
        phone: '2604123456',
      };

      const result = confirmBooking('10:30', 'device-a', clientData);
      expect(result.ok).toBe(false);
      expect(result.message).toBe('El tiempo para confirmar la reserva expiró');

      // 4. Verificar que en la base de datos el turno figura como "disponible" y sin reservas registradas
      const slot = getSlot('10:30');
      expect(slot?.status).toBe('disponible');
      expect(slot?.booking).toBeUndefined();
      expect(getReservations()).toHaveLength(0);

      // 5. Verificar que el dispositivo B puede ahora tomar el turno de 10:30
      const deviceBResult = selectSlot('10:30', 'device-b');
      expect(deviceBResult.ok).toBe(true);
      expect(getSlot('10:30')?.status).toBe('preseleccionado');
    });

    it('libera el turno inmediatamente al usar expireLock', () => {
      selectSlot('10:30', 'device-a');
      expireLock('10:30');
      expect(getSlot('10:30')?.status).toBe('disponible');
    });
  });
});
