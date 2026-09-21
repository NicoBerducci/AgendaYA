import { getDefaultHours, validateTimeRange, validateSaveConfig } from './horasTrabajo';

describe('Épica: Configuración de la Jornada Laboral', () => {

  // Prueba 1: Basada en US_002 (Precarga de horario por defecto)
  describe('US_002: Precarga de horario por defecto', () => {
    it('Debe devolver el horario predeterminado de 08:00 a 16:00', () => {
      const defaultHours = getDefaultHours();
      
      expect(defaultHours.startTime).toBe('08:00');
      expect(defaultHours.endTime).toBe('16:00');
    });
  });

  // Prueba 2: Basada en US_004 (Validación de coherencia horaria)
  describe('US_004: Validación de coherencia horaria', () => {
    it('Debe devolver error si la hora de fin es anterior a la hora de inicio', () => {
      // Simulamos que el usuario ingresa un horario invertido
      const result = validateTimeRange('18:00', '09:00');
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('La hora de fin debe ser posterior a la hora de inicio');
    });

    it('Debe ser válido si la hora de fin es posterior a la hora de inicio', () => {
      // Simulamos un horario correcto
      const result = validateTimeRange('09:00', '17:00');
      
      expect(result.isValid).toBe(true);
    });
  });

  // Prueba 3: Basada en US_005 (Guardado de configuración laboral)
  describe('US_005: Guardado de configuración', () => {
    it('Debe devolver error si se intenta guardar sin días seleccionados', () => {
      // Simulamos un array vacío (ningún día seleccionado)
      const selectedDays = []; 
      const result = validateSaveConfig(selectedDays);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Por favor, seleccione al menos un día para poder guardar');
    });

    it('Debe ser válido si hay al menos un día seleccionado', () => {
      // Simulamos que el usuario seleccionó el Lunes
      const selectedDays = ['Lunes']; 
      const result = validateSaveConfig(selectedDays);
      
      expect(result.isValid).toBe(true);
    });
  });

});