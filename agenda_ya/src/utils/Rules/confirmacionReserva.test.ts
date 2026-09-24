import { validarEmail, validarTelefono } from './confirmacionReserva';

describe('Pruebas unitarias para confirmacionReserva (US_033)', () => {
  
  describe('Función validarEmail()', () => {
    it('Debe retornar { isValid: true } para un email correcto', () => {
      // Arrange
      const email = "tomas.yanardi@gmail.com";
      
      // Act
      const result = validarEmail(email);
      
      // Assert
      expect(result.isValid).toBe(true);
    });

    it('Debe retornar { isValid: false } y un mensaje de error si el email no tiene "@"', () => {
      // Arrange
      const email = "tomas.yanardigmail.com";
      
      // Act
      const result = validarEmail(email);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
      expect(typeof result.errorMessage).toBe('string');
    });

    it('Debe retornar { isValid: false } si se envía un string vacío o nulo', () => {
      // Arrange
      const emailVacio = "";
      
      // Act
      const resultVacio = validarEmail(emailVacio);
      
      // Assert
      expect(resultVacio.isValid).toBe(false);
    });
  });

  describe('Función validarTelefono()', () => {
    it('Debe retornar { isValid: true } para un teléfono numérico válido', () => {
      // Arrange
      const telefono = "2604123456";
      
      // Act
      const result = validarTelefono(telefono);
      
      // Assert
      expect(result.isValid).toBe(true);
    });

    it('Debe retornar { isValid: false } y un mensaje si el teléfono contiene letras o caracteres inválidos', () => {
      // Arrange
      const telefonoInvalido = "2604ABC456";
      
      // Act
      const result = validarTelefono(telefonoInvalido);
      
      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
      expect(typeof result.errorMessage).toBe('string');
    });
  });
});
