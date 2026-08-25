import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntervalManagement } from './IntervalManagement';
import { resetScheduleState } from '../../services/scheduleService';

describe('US_012 — CP_006: Impedir eliminación de intervalo con reservas activas (Espejo Adriel)', () => {

  beforeEach(() => {
    // Prerrequisito: Intervalo con 3 reservas activas asociadas
    resetScheduleState({
      intervals: [
        {
          id: 1,
          dia: 'Lunes',
          turno: 'Turno 1',
          horario: '08:00 a 12:00',
          activeReservations: 3,
        },
      ],
      reservations: [
        { id: 101, intervalId: 1, fecha: 'F+7', estado: 'confirmada' },
        { id: 102, intervalId: 1, fecha: 'F+14', estado: 'confirmada' },
        { id: 103, intervalId: 1, fecha: 'F+21', estado: 'confirmada' },
      ],
    });
  });

  it('CP_006 - Rechaza la eliminación del turno con 3 reservas activas, muestra mensaje exacto y mantiene el intervalo y reservas intactos al recargar', async () => {
    // 1. Renderear módulo de configuración de horarios
    const { unmount } = render(<IntervalManagement />);

    // 2. Ubicar el intervalo "Turno 1 — Lunes — 08:00 a 12:00"
    await waitFor(() => {
      expect(screen.getByText('Turno 1')).toBeInTheDocument();
      expect(screen.getByText('Lunes')).toBeInTheDocument();
      expect(screen.getByText('08:00 a 12:00')).toBeInTheDocument();
    });

    // 3. Presionar el ícono de eliminar (basurero)
    const deleteButton = screen.getByRole('button', { name: /eliminar turno 1 — lunes — 08:00 a 12:00/i });
    fireEvent.click(deleteButton);

    // Se muestra el modal de confirmación con el texto exacto
    await waitFor(() => {
      expect(screen.getByText('¿Está seguro de que desea eliminar el turno?')).toBeInTheDocument();
    });

    // 4. Presionar "SI"
    const yesButton = screen.getByRole('button', { name: /^si$/i });
    fireEvent.click(yesButton);

    // El sistema rechaza y muestra el mensaje exacto
    await waitFor(() => {
      expect(
        screen.getByText('No se puede eliminar el intervalo porque tiene 3 reservas activas')
      ).toBeInTheDocument();
    });

    // 5. Cerrar el mensaje de error y observar la grilla
    const closeErrorButton = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeErrorButton);

    // El intervalo sigue visible en la grilla y sin modificaciones
    expect(screen.getByText('Turno 1')).toBeInTheDocument();
    expect(screen.getByText('08:00 a 12:00')).toBeInTheDocument();

    // 6. Consultar listado de reservas asociadas ➔ las 3 reservas siguen en estado "confirmada"
    const reservationsSection = screen.getByText(/Listado de Reservas Asociadas/i).closest('div');
    expect(reservationsSection).toHaveTextContent('Reserva ID #101');
    expect(reservationsSection).toHaveTextContent('Reserva ID #102');
    expect(reservationsSection).toHaveTextContent('Reserva ID #103');
    const confirmedBadges = screen.getAllByText(/Estado: confirmada/i);
    expect(confirmedBadges).toHaveLength(3);

    // 7. Recargar el módulo (remontar el componente y re-consultar el servicio)
    unmount();

    render(<IntervalManagement />);

    // El intervalo sigue presente en la persistencia del servicio
    await waitFor(() => {
      expect(screen.getByText('Turno 1')).toBeInTheDocument();
      expect(screen.getByText('08:00 a 12:00')).toBeInTheDocument();
      expect(screen.getByText('3 reservas activas')).toBeInTheDocument();
    });
  });

});
