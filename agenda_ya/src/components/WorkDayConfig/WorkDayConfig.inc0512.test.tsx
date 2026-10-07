import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkDayConfig } from './WorkDayConfig';
import { resetScheduleState } from '../../services/scheduleService';

// INC-0512: Rechazo incorrecto de intervalos contiguos (no superpuestos) en WorkDayConfig.
// Síntoma: al agregar un intervalo que empieza justo cuando termina otro ya existente en el
//   mismo día (ej.: Lunes ya tiene 08:00 a 12:00 y se agrega 12:00 a 16:00), el guardado global
//   se bloquea mostrando "Hay superposición de horarios en el día Lunes", pese a que los
//   intervalos son contiguos y no se superponen realmente (solo comparten el instante límite).
// Causa: en handleGlobalSave (WorkDayConfig.tsx) la validación de superposición usa comparación
//   no estricta (start1 <= end2 && start2 <= end1), por lo que dos intervalos que solo tocan el
//   mismo límite (fin de uno == inicio del otro) se evalúan como superpuestos.
// Con el defecto: este test falla porque aparece el mensaje de error de superposición en vez del
//   mensaje de éxito.
// Con el fix (comparación estricta, start1 < end2 && start2 < end1): el intervalo contiguo se
//   acepta y el test pasa mostrando "Configuración guardada exitosamente."
describe('INC-0512: Intervalos contiguos en WorkDayConfig', () => {
  beforeEach(() => {
    resetScheduleState();
  });

  it('Permite guardar un intervalo que empieza justo cuando termina otro (sin superposición real)', async () => {
    // Arrange
    const { container } = render(<WorkDayConfig />);
    await waitFor(() => {
      expect(screen.getByText('Configurar Jornada Laboral')).toBeInTheDocument();
    });

    // Act
    const addBtn = screen.getByTitle('Agregar nuevo intervalo');
    fireEvent.click(addBtn);

    const startInput = container.querySelector('[data-cy="input-start-time"]') as HTMLInputElement;
    const endInput = container.querySelector('[data-cy="input-end-time"]') as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: '12:00' } });
    fireEvent.change(endInput, { target: { value: '16:00' } });

    const saveBtnsModal = screen.getAllByRole('button', { name: /^Guardar$/i });
    fireEvent.click(saveBtnsModal[saveBtnsModal.length - 1]);

    const globalSaveBtn = screen.getByRole('button', { name: /^Guardar$/i });
    fireEvent.click(globalSaveBtn);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
    });
    expect(screen.queryByText(/Hay superposición de horarios/i)).not.toBeInTheDocument();
    expect(screen.getByText('Configuración guardada exitosamente.')).toBeInTheDocument();
  });
});
