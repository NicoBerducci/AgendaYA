import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PublicBookingDemo } from './PublicBookingDemo';
import { getSlot, getReservations, resetPublicBookingState } from '../../services/publicBookingService';

describe('Módulo 4: Confirmación y Vencimiento de Reserva (Tomás Yanardi)', () => {
  const TEST_DATE = '2026-09-02'; // Fecha F + 7 para las pruebas

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-02T10:00:00.000Z'));
    resetPublicBookingState(TEST_DATE);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('CP_013 — Confirmación exitosa de reserva (US_034 / M04-R04F - Tomás Yanardi)', () => {
    it('registra la reserva antes de que expire el contador, muestra el resumen del turno y excluye el horario para otros usuarios', async () => {
      render(<PublicBookingDemo targetDateStr={TEST_DATE} />);

      // Prerrequisito: Dispositivo A selecciona 10:30
      const initialSlots = screen.getAllByRole('button', { name: '10:30' });
      expect(initialSlots).toHaveLength(2);

      fireEvent.click(initialSlots[0]); // Seleccionar en Dispositivo A
      const continuarButtons = screen.getAllByRole('button', { name: 'Continuar' });
      fireEvent.click(continuarButtons[0]);

      // Paso 1: Observar el formulario de datos personales con el contador regresivo visible
      expect(screen.getByText(/Tiempo restante para completar la reserva: 10:00 min/)).toBeInTheDocument();
      const confirmButton = screen.getByRole('button', { name: 'Confirmar' });
      expect(confirmButton).toBeEnabled();

      // Completar / verificar datos de prueba de Tomás Yanardi
      const nameInput = screen.getByLabelText(/Nombre completo/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Teléfono/i);

      fireEvent.change(nameInput, { target: { value: 'Tomás Yanardi' } });
      fireEvent.change(emailInput, { target: { value: 'tomas.yanardi@gmail.com' } });
      fireEvent.change(phoneInput, { target: { value: '2604123456' } });

      // Paso 2: Presionar el botón "Confirmar" antes de que expire el contador
      fireEvent.click(confirmButton);

      // Paso 3: Observar la pantalla de confirmación con el resumen completo
      expect(screen.getByText(/¡Reserva confirmada!/i)).toBeInTheDocument();
      expect(screen.getByText('5 de 5 — Confirmación')).toBeInTheDocument();
      expect(screen.getAllByText(/Consulta general/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/10:30 a 11:00 hs/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Tomás Yanardi').length).toBeGreaterThan(0);
      expect(screen.getAllByText('tomas.yanardi@gmail.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2604123456').length).toBeGreaterThan(0);

      // Paso 4: Consultar el estado del turno en la base de datos (backend)
      const slotBackend = getSlot('10:30');
      expect(slotBackend?.status).toBe('reservado');
      expect(slotBackend?.booking?.fullName).toBe('Tomás Yanardi');
      expect(slotBackend?.booking?.time).toBe('10:30');
      expect(slotBackend?.booking?.endTime).toBe('11:00');

      const allReservations = getReservations();
      expect(allReservations).toHaveLength(1);
      expect(allReservations[0].fullName).toBe('Tomás Yanardi');

      // Paso 5: Abrir el enlace público como un segundo usuario (Dispositivo B)
      act(() => {
        jest.advanceTimersByTime(600); // Polling < 2 segundos
      });

      const remainingSlots = screen.getAllByRole('button', { name: '10:30' });
      expect(remainingSlots).toHaveLength(1); // Solo Dispositivo B lo tiene renderizado
      expect(remainingSlots[0]).toBeDisabled(); // El horario ya NO está disponible
    });
  });

  describe('CP_014 — Rechazo de confirmación por vencimiento del bloqueo temporal (US_035 / M04-R04F - Tomás Yanardi)', () => {
    it('rechaza la confirmación al agotarse los 10 minutos, muestra mensaje exacto y libera el turno en la base de datos y para otros usuarios', async () => {
      render(<PublicBookingDemo targetDateStr={TEST_DATE} />);

      // Prerrequisito: Dispositivo A preselecciona 10:30
      const initialSlots = screen.getAllByRole('button', { name: '10:30' });
      fireEvent.click(initialSlots[0]);

      const continuarButtons = screen.getAllByRole('button', { name: 'Continuar' });
      fireEvent.click(continuarButtons[0]);

      // Formulario con datos de Tomás Yanardi
      const nameInput = screen.getByLabelText(/Nombre completo/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Teléfono/i);

      fireEvent.change(nameInput, { target: { value: 'Tomás Yanardi' } });
      fireEvent.change(emailInput, { target: { value: 'tomas.yanardi@gmail.com' } });
      fireEvent.change(phoneInput, { target: { value: '2604123456' } });

      // Paso 1: Dejar transcurrir los 10 minutos (600.000 ms) sin presionar Confirmar
      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000 + 1000);
      });

      // Paso 2 y 3: Observar el mensaje mostrado en pantalla
      expect(screen.getByText('El tiempo para confirmar la reserva expiró')).toBeInTheDocument();

      // Paso 4: Consultar el estado del turno de las 10:30 en la base de datos
      const slotBackend = getSlot('10:30');
      expect(slotBackend?.status).toBe('disponible');
      expect(slotBackend?.booking).toBeUndefined();

      // Paso 5: En el Dispositivo B, actualizar listado de horarios
      act(() => {
        jest.advanceTimersByTime(600);
      });

      const deviceBSlots = screen.getAllByRole('button', { name: '10:30' });
      const deviceBSlot = deviceBSlots[deviceBSlots.length - 1];
      expect(deviceBSlot).toBeEnabled(); // Vuelve a ofrecerse como disponible

      // Paso 6: Verificar el listado de reservas del administrador
      const reservations = getReservations();
      expect(reservations).toHaveLength(0); // No existe ninguna reserva registrada
    });
  });
});
