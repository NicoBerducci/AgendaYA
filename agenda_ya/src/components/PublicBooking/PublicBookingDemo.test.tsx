import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { PublicBookingDemo } from './PublicBookingDemo';

describe('CP_011 — Selección de horario con bloqueo temporal e inicio de contador (Gracia Ignacio)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('bloquea el turno elegido en el Dispositivo A al presionar Continuar, muestra el contador y lo excluye del Dispositivo B', () => {
    render(<PublicBookingDemo targetDateStr="2026-09-02" />);

    // Ambos dispositivos ven inicialmente el mismo horario disponible
    const initialButtons = screen.getAllByRole('button', { name: '10:30' });
    expect(initialButtons).toHaveLength(2);

    // El Dispositivo A selecciona el horario (queda "preseleccionado" localmente)...
    fireEvent.click(initialButtons[0]);
    expect(screen.getByText(/Turno de 10:30 hs preseleccionado/)).toBeInTheDocument();

    // ...y recién al presionar "Continuar" el sistema registra el bloqueo temporal
    const continuarButtons = screen.getAllByRole('button', { name: 'Continuar' });
    fireEvent.click(continuarButtons[0]);

    expect(screen.getByText(/Tiempo restante para completar la reserva: 10:00 min/)).toBeInTheDocument();

    // El Dispositivo B refresca su listado (polling < 2 segundos)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    const remainingButtons = screen.getAllByRole('button', { name: '10:30' });
    expect(remainingButtons).toHaveLength(1);
    expect(remainingButtons[0]).toBeDisabled();
  });
});
