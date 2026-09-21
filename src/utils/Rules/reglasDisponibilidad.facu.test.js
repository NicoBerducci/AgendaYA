// Tests complementarios a reglasDisponibilidad.test.js
// Integrante: Espínola Facundo
// US_019/US_020

import { configureRestPeriod, calculateNextAvailableSlot } from './reglasDisponibilidad';

describe('Reglas de Disponibilidad - Facundo (US_019/US_020)', () => {
  
  it('1. configureRestPeriod(15) -> caso normal (coincide con CP_007)', () => {
    const result = configureRestPeriod(15);
    expect(result.isValid).toBe(true);
    expect(result.valor).toBe(15);
    expect(result.successMessage).toBe('El intervalo entre turnos fue configurado exitosamente');
  });

  it('2. configureRestPeriod(121) -> caso error (coincide con CP_008)', () => {
    const result = configureRestPeriod(121);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('El intervalo debe estar entre 0 y 120 minutos');
  });

  it('3. configureRestPeriod(120) -> caso borde (límite superior exacto)', () => {
    const result = configureRestPeriod(120);
    expect(result.isValid).toBe(true);
    expect(result.valor).toBe(120);
  });

  it('4. calculateNextAvailableSlot(\'09:00\', 15) -> caso normal', () => {
    const result = calculateNextAvailableSlot('09:00', 15);
    expect(result).toBe('09:15');
  });

  it('5. calculateNextAvailableSlot(\'23:50\', 20) -> caso borde (cruce de medianoche)', () => {
    const result = calculateNextAvailableSlot('23:50', 20);
    expect(result).toBe('00:10');
  });

});
