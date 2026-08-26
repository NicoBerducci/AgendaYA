import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesktopAccessGuard } from './DesktopAccessGuard';

describe('CP_012 — Acceso al módulo público de reserva desde Desktop (Gracia Ignacio)', () => {
  it('bloquea el acceso y muestra el mensaje cuando el User-Agent simulado es Desktop', () => {
    render(<DesktopAccessGuard />);

    expect(
      screen.getByText('Para realizar una reserva, ingrese desde un dispositivo móvil')
    ).toBeInTheDocument();
    expect(screen.queryByText(/Seleccioná el tipo de evento/i)).not.toBeInTheDocument();
  });

  it('mantiene el bloqueo aunque se reduzca el ancho de la ventana (el criterio es solo el User-Agent)', () => {
    render(<DesktopAccessGuard />);

    fireEvent.click(screen.getByLabelText(/Achicar ventana/i));

    expect(
      screen.getByText('Para realizar una reserva, ingrese desde un dispositivo móvil')
    ).toBeInTheDocument();
  });

  it('permite continuar hacia el selector de tipo de evento cuando el User-Agent simulado es Mobile', () => {
    render(<DesktopAccessGuard />);

    fireEvent.click(screen.getByRole('button', { name: /User-Agent: Mobile/i }));

    expect(screen.getByText(/Seleccioná el tipo de evento/i)).toBeInTheDocument();
    expect(
      screen.queryByText('Para realizar una reserva, ingrese desde un dispositivo móvil')
    ).not.toBeInTheDocument();
  });
});
