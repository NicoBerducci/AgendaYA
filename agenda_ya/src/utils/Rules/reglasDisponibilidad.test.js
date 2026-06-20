import { validarAntelacion, esHorarioVisible, validarLimiteDiario, configureRestPeriod, calculateNextAvailableSlot } from './reglasDisponibilidad';

describe('Épica: Reglas de Disponibilidad', () => {

  // PRUEBA 1: correspondendiente a US_021
  describe('US_021: Configurar antelación mínima', () => {
    it('Debe devolver error si el valor está fuera del rango (ej. 75 horas)', () => {
      const resultado = validarAntelacion(75, 'Consulta General');
      
      expect(resultado.isValid).toBe(false);
      expect(resultado.errorMessage).toBe('El valor de antelación para el evento Consulta General debe estar entre 0 y 72 horas');
    });

    it('Debe configurar la antelación en 0 si no se asigna un valor', () => {
      const resultado = validarAntelacion(null, 'Consulta General');
      
      expect(resultado.isValid).toBe(true);
      expect(resultado.valor).toBe(0);
    });
  });

  // PRUEBA 2: correspondendiente a US_022
  describe('US_022: Ocultar horarios fuera de antelación', () => {
    it('No debe mostrar horarios que estén dentro de la ventana de antelación mínima', () => {
      // Escenario 1: Son las 10:00, antelación 2hs, turno a las 11:00 (Invalido)
      const horaActual = new Date('2026-06-19T10:00:00');
      const horaTurno = new Date('2026-06-19T11:00:00');
      const antelacionMinima = 2; 

      const visible = esHorarioVisible(horaActual, horaTurno, antelacionMinima);
      expect(visible).toBe(false);
    });

    it('Debe mostrar el horario si supera la antelación mínima', () => {
      // Escenario 2: Son las 10:00, antelación 2hs, turno a las 13:00 (Válido)
      const horaActual = new Date('2026-06-19T10:00:00');
      const horaTurno = new Date('2026-06-19T13:00:00');
      const antelacionMinima = 2;

      const visible = esHorarioVisible(horaActual, horaTurno, antelacionMinima);
      expect(visible).toBe(true);
    });
  });

  // PRUEBA 3: correspondendiente a US_023
  describe('US_023: Configurar límite diario de reservas', () => {
    it('Debe devolver error si se ingresa un valor de 0', () => {
      const resultado = validarLimiteDiario(0);
      
      expect(resultado.isValid).toBe(false);
      expect(resultado.errorMessage).toBe('El límite debe ser un número entero mayor a 0');
    });

    it('Debe asimilar "sin límite" si el campo se envía vacío', () => {
      const resultado = validarLimiteDiario(''); // Campo vacío
      
      expect(resultado.isValid).toBe(true);
      expect(resultado.sinLimite).toBe(true);
    });
  });

  // PRUEBA 4: correspondiente a US_019
  describe('US_019: Configurar descanso entre reservas', () => {
    it('Debe guardar el valor y mostrar mensaje de éxito si el intervalo está entre 0 y 120', () => {
      const result = configureRestPeriod(15);
      expect(result.isValid).toBe(true);
      expect(result.successMessage).toBe('El intervalo entre turnos fue configurado exitosamente');
      expect(result.valor).toBe(15);
    });

    it('Debe impedir el guardado y devolver error si el valor es mayor a 120', () => {
      const result = configureRestPeriod(130);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('El intervalo debe estar entre 0 y 120 minutos');
    });

    it('Debe impedir el guardado y devolver error si el valor es menor a 0', () => {
      const result = configureRestPeriod(-10);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('El intervalo debe estar entre 0 y 120 minutos');
    });
  });

  // PRUEBA 5: correspondiente a US_020
  describe('US_020: Aplicar descanso en la agenda pública', () => {
    it('Debe calcular el próximo turno sumando el tiempo de descanso activo', () => {
      const result = calculateNextAvailableSlot('10:30', 15);
      expect(result).toBe('10:45');
    });

    it('Debe calcular el próximo turno consecutivo si el descanso es cero', () => {
      const result = calculateNextAvailableSlot('10:30', 0);
      expect(result).toBe('10:30');
    });
  });

});