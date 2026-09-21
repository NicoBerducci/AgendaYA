import { precargarHorarioDefecto, validarCoherenciaHoraria } from '../src/utils/logica-negocio';

describe('Lógica de Negocio', () => {
    describe('precargarHorarioDefecto', () => {
        it('debe devolver 08:00 a 16:00 para un día laborable como Lunes', () => {
            const resultado = precargarHorarioDefecto('Lunes');
            expect(resultado).toEqual({ inicio: '08:00', fin: '16:00' });
        });

        it('debe devolver null para un día inválido', () => {
            const resultado = precargarHorarioDefecto('Feriado');
            expect(resultado).toBeNull();
        });
    });

    describe('validarCoherenciaHoraria', () => {
        it('debe devolver true si la hora de fin es posterior a la hora de inicio', () => {
            const resultado = validarCoherenciaHoraria('08:00', '16:00');
            expect(resultado).toBe(true);
        });

        it('debe devolver false si la hora de fin y la hora de inicio son exactamente iguales', () => {
            const resultado = validarCoherenciaHoraria('10:00', '10:00');
            expect(resultado).toBe(false);
        });

        it('debe devolver false si la hora de fin es anterior a la hora de inicio', () => {
            const resultado = validarCoherenciaHoraria('18:00', '09:00');
            expect(resultado).toBe(false);
        });
    });
});
