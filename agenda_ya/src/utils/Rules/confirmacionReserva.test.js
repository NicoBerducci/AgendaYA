import { validarEmail, validarNombre, validarExpiracion } from './confirmacionReserva';

describe('Épica: Confirmación de Reserva', () => {

  // PRUEBA 1: correspondiente a US_033 (Email)
  describe('US_033: Validación de datos obligatorios - Email', () => {
    it('Debe devolver error si se ingresa un email inválido como "usuario@"', () => {
      const resultado = validarEmail('usuario@');
      
      expect(resultado.isValid).toBe(false);
      expect(resultado.errorMessage).toBe('Ingrese un email válido para continuar');
    });

    it('Debe devolver válido si el email tiene un formato correcto', () => {
      const resultado = validarEmail('tomas@ejemplo.com');
      
      expect(resultado.isValid).toBe(true);
    });
  });

  // PRUEBA 2: correspondiente a US_033 (Nombre)
  describe('US_033: Validación de datos obligatorios - Nombre', () => {
    it('Debe devolver error si el nombre ingresado es inválido (ej. "a")', () => {
      const resultado = validarNombre('a');
      
      expect(resultado.isValid).toBe(false);
      expect(resultado.errorMessage).toBe('Ingrese un nombre válido para continuar');
    });

    it('Debe devolver válido si el nombre es correcto', () => {
      const resultado = validarNombre('Tomás');
      
      expect(resultado.isValid).toBe(true);
    });
  });

  // PRUEBA 3: correspondiente a US_035 (Expiración)
  describe('US_035: Rechazar confirmación por vencimiento', () => {
    it('Debe devolver error si pasaron más de 10 minutos desde el bloqueo', () => {
      // Simulamos que el turno se bloqueó a las 10:00 y el usuario confirma a las 10:11 (11 minutos)
      const horaBloqueo = new Date('2026-06-24T10:00:00');
      const horaConfirmacion = new Date('2026-06-24T10:11:00');

      const resultado = validarExpiracion(horaBloqueo, horaConfirmacion);
      
      expect(resultado.isValid).toBe(false);
      expect(resultado.errorMessage).toBe('El tiempo para confirmar la reserva expiró');
    });

    it('Debe permitir la confirmación si está dentro de los 10 minutos', () => {
      // Simulamos que pasaron solo 5 minutos
      const horaBloqueo = new Date('2026-06-24T10:00:00');
      const horaConfirmacion = new Date('2026-06-24T10:05:00');

      const resultado = validarExpiracion(horaBloqueo, horaConfirmacion);
      
      expect(resultado.isValid).toBe(true);
    });
  });

});