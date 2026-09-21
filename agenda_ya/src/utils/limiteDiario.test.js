import { validarLimiteDiario, actualizarEstadoPerfil } from './limiteDiario';

describe('AgendaYA - M02 - Límite Diario (Lógica de Negocio)', () => {
  describe('validarLimiteDiario', () => {
    it('retorna true para un límite válido (entero mayor a 0)', () => {
      expect(validarLimiteDiario(10)).toBe(true);
      expect(validarLimiteDiario('5')).toBe(true);
    });

    it('retorna false para un límite de 0', () => {
      expect(validarLimiteDiario(0)).toBe(false);
      expect(validarLimiteDiario('0')).toBe(false);
    });

    it('retorna false para números negativos', () => {
      expect(validarLimiteDiario(-5)).toBe(false);
    });

    it('retorna false para valores no numéricos', () => {
      expect(validarLimiteDiario('abc')).toBe(false);
      expect(validarLimiteDiario(null)).toBe(false);
    });
  });

  describe('actualizarEstadoPerfil', () => {
    it('actualiza correctamente el límite de un perfil existente', () => {
      const db = { 'admin123': { id: 'admin123', limiteReservas: 5 } };
      const resultado = actualizarEstadoPerfil('admin123', 10, db);
      expect(resultado.limiteReservas).toBe(10);
      expect(db['admin123'].limiteReservas).toBe(10);
    });
  });
});
