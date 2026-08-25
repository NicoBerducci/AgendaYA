import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RestPeriodConfig } from './RestPeriodConfig';
import { resetRestPeriod } from '../../services/restPeriodService';

describe('US_019 - Pruebas de Interfaz Visual para Configurar descanso entre reservas', () => {

  describe('CP_007 — Positivo: Configurar descanso entre reservas válido', () => {
    beforeEach(() => {
      // Prerrequisito: El valor de descanso global está en su estado inicial de 0 minutos
      resetRestPeriod(0);
    });

    it('CP_007 - Permite ingresar 15 minutos, guarda exitosamente y persiste el valor al volver a entrar', async () => {
      // 1. Renderear componente y presionar "Configurar descansos entre reservas"
      const { unmount } = render(<RestPeriodConfig />);
      const openButton = screen.getByRole('button', { name: /configurar descansos entre reservas/i });
      fireEvent.click(openButton);

      // Verificar modal abierto con el texto exacto y valor precargado 0
      await waitFor(() => {
        expect(screen.getByText('Ingrese el intervalo de descanso en minutos que desea:')).toBeInTheDocument();
      });
      const input = screen.getByLabelText(/minutos de descanso/i) as HTMLInputElement;
      expect(input.value).toBe('0');

      // 2. Ingresar 15 en el campo
      fireEvent.change(input, { target: { value: '15' } });
      expect(input.value).toBe('15');

      // 3. Presionar "Guardar"
      const saveButton = screen.getByRole('button', { name: /^guardar$/i });
      fireEvent.click(saveButton);

      // Se muestra el mensaje exacto de éxito
      await waitFor(() => {
        expect(
          screen.getByText('El intervalo entre turnos fue configurado exitosamente')
        ).toBeInTheDocument();
      });

      // 4. Cerrar el modal, salir del módulo (unmount) y volver a entrar (render de nuevo)
      const closeButton = screen.getByRole('button', { name: /cerrar/i });
      fireEvent.click(closeButton);

      // Desmontar el componente completamente
      unmount();

      // Volver a montar el componente
      render(<RestPeriodConfig />);
      const newOpenButton = screen.getByRole('button', { name: /configurar descansos entre reservas/i });
      fireEvent.click(newOpenButton);

      // El campo debe mostrar 15 (persistencia real confirmada)
      await waitFor(() => {
        const reloadedInput = screen.getByLabelText(/minutos de descanso/i) as HTMLInputElement;
        expect(reloadedInput.value).toBe('15');
      });
    });
  });

  describe('CP_008 — Negativo: Configurar descanso entre reservas fuera de límite', () => {
    beforeEach(() => {
      // Prerrequisito: El valor de descanso global está preconfigurado en 15 minutos (seed)
      resetRestPeriod(15);
    });

    it('CP_008 - Rechaza 121 minutos con el mensaje de error exacto y mantiene el valor vigente (15)', async () => {
      // 1. Renderear componente y presionar "Configurar descansos entre reservas"
      const { unmount } = render(<RestPeriodConfig />);
      const openButton = screen.getByRole('button', { name: /configurar descansos entre reservas/i });
      fireEvent.click(openButton);

      // Modal se abre y el campo muestra el valor vigente 15
      await waitFor(() => {
        expect(screen.getByText('Ingrese el intervalo de descanso en minutos que desea:')).toBeInTheDocument();
      });
      const input = screen.getByLabelText(/minutos de descanso/i) as HTMLInputElement;
      expect(input.value).toBe('15');

      // 2. Ingresar 121 en el campo
      fireEvent.change(input, { target: { value: '121' } });
      expect(input.value).toBe('121');

      // 3. Presionar "Guardar"
      const saveButton = screen.getByRole('button', { name: /^guardar$/i });
      fireEvent.click(saveButton);

      // El guardado se rechaza y muestra mensaje exacto de error
      await waitFor(() => {
        expect(
          screen.getByText('El intervalo debe estar entre 0 y 120 minutos')
        ).toBeInTheDocument();
      });

      // 4. Cerrar el modal, salir del módulo (unmount) y volver a entrar
      const closeButton = screen.getByRole('button', { name: /cerrar/i });
      fireEvent.click(closeButton);

      unmount();

      render(<RestPeriodConfig />);
      const newOpenButton = screen.getByRole('button', { name: /configurar descansos entre reservas/i });
      fireEvent.click(newOpenButton);

      // El campo debe seguir mostrando 15 (el valor no fue modificado)
      await waitFor(() => {
        const reloadedInput = screen.getByLabelText(/minutos de descanso/i) as HTMLInputElement;
        expect(reloadedInput.value).toBe('15');
      });
    });
  });

});
