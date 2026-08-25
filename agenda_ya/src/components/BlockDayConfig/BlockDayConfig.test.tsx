import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BlockDayConfig } from './BlockDayConfig';
import { resetScheduleState } from '../../services/scheduleService';

describe('US_013 — CP_005: Bloquear un día sin reservas previas (Espejo Adriel)', () => {

  const testDateStr = '2026-09-01'; // Fecha F + 7 para el test

  beforeEach(() => {
    // Prerrequisito: Fecha en estado "Disponible", sin reservas activas
    resetScheduleState({
      blockedDays: {},
      reservations: [],
    });
  });

  it('CP_005 - Bloquea fecha F+7 exitosamente, actualiza vista interna a Bloqueado y oculta la fecha en la vista pública', async () => {
    // 1. Renderear el componente de configuración de disponibilidad
    render(<BlockDayConfig targetDateStr={testDateStr} />);

    // Verificar que la jornada laboral precargada es visible
    expect(screen.getByText(/Jornada Laboral Cargada:/i)).toBeInTheDocument();

    // 2. Seleccionar el modo "Bloqueo" en el selector
    const modeSelector = screen.getByLabelText(/Modo de edición/i);
    fireEvent.change(modeSelector, { target: { value: 'Bloqueo' } });
    expect(modeSelector).toHaveValue('Bloqueo');

    // 3. Seleccionar en el calendario la fecha F + 7
    const calendarButton = screen.getByRole('button', { name: new RegExp(`Fecha F\\+7 \\(${testDateStr}\\)`, 'i') });
    fireEvent.click(calendarButton);

    // La fecha queda en el panel lateral con campo de motivo editable
    const sidePanel = screen.getByLabelText(/Panel lateral/i);
    expect(sidePanel).toHaveTextContent(`Fecha: ${testDateStr}`);
    const reasonInput = screen.getByLabelText(/Motivo/i) as HTMLInputElement;
    expect(reasonInput.value).toBe('');

    // 4. Presionar "Guardar" sin completar el motivo
    const saveButton = screen.getByRole('button', { name: /^guardar$/i });
    fireEvent.click(saveButton);

    // Se muestra el modal de confirmación con el texto exacto
    await waitFor(() => {
      expect(screen.getByText('¿Estás seguro de bloquear esta fecha?')).toBeInTheDocument();
    });

    // 5. Presionar "SI" en el modal
    const yesButton = screen.getByRole('button', { name: /^si$/i });
    fireEvent.click(yesButton);

    // El sistema aplica el bloqueo y muestra el mensaje exacto
    await waitFor(() => {
      expect(
        screen.getByText(`Los siguientes días fueron bloqueados exitosamente: ${testDateStr}`)
      ).toBeInTheDocument();
    });

    // El panel lateral queda vacío
    expect(screen.getByText(/No hay fechas seleccionadas en el panel/i)).toBeInTheDocument();

    // 6. Consultar detalle de la fecha F + 7 en la vista interna ➔ figura con estado "Bloqueado"
    await waitFor(() => {
      expect(screen.getByText(/Detalle Vista Interna Admin:/i)).toBeInTheDocument();
      expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    });

    // 7 & 8. Verificar la vista pública simulada
    // La fecha bloqueada NO figura como seleccionable
    expect(screen.getByText(/No seleccionable \(Sin turnos ofrecidos\)/i)).toBeInTheDocument();

    // NO se muestra ningún motivo interno ni dato de configuración en la vista pública
    const publicSection = screen.getByText(/Vista Pública de la Agenda/i).closest('div');
    expect(publicSection).not.toHaveTextContent(/Motivo interno/i);
  });

});
