import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkDayConfig } from './WorkDayConfig';
import { resetScheduleState } from '../../services/scheduleService';

describe('Casos de prueba de Paula Bomprezzi (CP_003 y CP_004) en WorkDayConfig', () => {

  beforeEach(() => {
    resetScheduleState();
  });

  const waitForLoad = async () => {
    await waitFor(() => {
      expect(screen.getByText('Configurar Jornada Laboral')).toBeInTheDocument();
    });
  };

  it('CP_003 (Positivo): Deshabilitar un intervalo temporalmente', async () => {
    render(<WorkDayConfig />);
    await waitForLoad();

    // Lunes (Turno 1), Miércoles (Turno 1), Miércoles (Turno 2) están habilitados.
    // Botones de deshabilitar están en orden: Lunes T1, Miércoles T1, Miércoles T2.
    // Buscamos el de Miércoles Turno 1 (índice 1)
    const disableButtons = screen.getAllByTitle('Deshabilitar intervalo');
    fireEvent.click(disableButtons[1]);

    // Verificar popup de éxito
    await waitFor(() => {
      expect(screen.getByText(/Se deshabilitó el intervalo del turno Turno 1 del día Miércoles exitosamente/i)).toBeInTheDocument();
    });

    // Cerrar el modal de aviso
    fireEvent.click(screen.getByRole('button', { name: /ok/i }));

    // Verificar que ahora aparece el botón de rehabilitar para Miércoles Turno 1, además del de Martes Turno 1
    const enableButtons = screen.getAllByTitle('Rehabilitar intervalo');
    expect(enableButtons.length).toBeGreaterThan(1);
  });

  it('CP_003 (Rehabilitar): Rehabilitar un intervalo deshabilitado (Martes)', async () => {
    render(<WorkDayConfig />);
    await waitForLoad();

    // Martes viene deshabilitado por defecto en la UI de prueba
    const enableButtons = screen.getAllByTitle('Rehabilitar intervalo');
    fireEvent.click(enableButtons[0]);

    // Verificar popup de habilitación exitosa
    await waitFor(() => {
      expect(screen.getByText(/Se habilitó el intervalo del turno Turno 1 del día Martes exitosamente/i)).toBeInTheDocument();
    });
  });

  it('CP_004 (Negativo): Control de intervalos superpuestos', async () => {
    render(<WorkDayConfig />);
    await waitForLoad();

    // 1. Presionar "Agregar Turno" (+)
    const addBtn = screen.getByTitle('Agregar nuevo intervalo');
    fireEvent.click(addBtn);

    // 2. Verificar que se abrió el modal
    expect(screen.getByText(/Ingrese el intervalo de horario deseado/i)).toBeInTheDocument();

    // 3. El modal viene con Lunes seleccionado y horario 11:00 a 15:00 (que solapa con 08:00 a 12:00 de Lunes)
    // Presionar "Guardar" del modal (el segundo botón Guardar renderizado en el DOM cuando está el modal)
    const saveBtnsModal = screen.getAllByRole('button', { name: /^Guardar$/i });
    fireEvent.click(saveBtnsModal[saveBtnsModal.length - 1]);

    // 4. El modal se cierra y el turno se agrega temporalmente a la tabla.
    // Ahora presionamos el botón "Guardar" global (el principal)
    const globalSaveBtn = screen.getByRole('button', { name: /^Guardar$/i });
    fireEvent.click(globalSaveBtn);

    // 5. Debe bloquearse el guardado real y mostrar el mensaje exacto de error
    await waitFor(() => {
      expect(screen.getByText(/Hay superposición de horarios en el día Lunes/i)).toBeInTheDocument();
    });
  });

});
