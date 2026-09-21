// Complementario a reglasDisponibilidad.test.js
// Integrante: Espínola Facundo
// US_019/US_020

import { configureRestPeriod, calculateNextAvailableSlot } from './reglasDisponibilidad';

describe('reglasDisponibilidad - Configuración de descanso (Facundo)', () => {
  it('1. configureRestPeriod(15) -> normal: isValid true, valor 15, successMessage "El intervalo entre turnos fue configurado exitosamente"', () => {
    const result = configureRestPeriod(15);
    expect(result.isValid).toBe(true);
    expect(result.valor).toBe(15);
    expect(result.successMessage).toBe('El intervalo entre turnos fue configurado exitosamente');
  });

  it('2. configureRestPeriod(121) -> error: isValid false, errorMessage "El intervalo debe estar entre 0 y 120 minutos"', () => {
    const result = configureRestPeriod(121);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('El intervalo debe estar entre 0 y 120 minutos');
  });

  it('3. configureRestPeriod(120) -> borde (límite superior exacto): isValid true, valor 120', () => {
    const result = configureRestPeriod(120);
    expect(result.isValid).toBe(true);
    expect(result.valor).toBe(120);
  });

  it('4. calculateNextAvailableSlot(\'09:00\', 15) -> normal: debe devolver \'09:15\'', () => {
    const result = calculateNextAvailableSlot('09:00', 15);
    expect(result).toBe('09:15');
  });

  it('5. calculateNextAvailableSlot(\'23:50\', 20) -> borde (cruce de medianoche): debe devolver \'00:10\'', () => {
    const result = calculateNextAvailableSlot('23:50', 20);
    expect(result).toBe('00:10');
  });
});
