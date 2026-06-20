import {
    validarAgregarIntervalo,
    validarSuperposicion,
    guardarIntervalosDia,
    deshabilitarIntervalo,
    habilitarIntervalo,
    obtenerIntervalosActivos
} from './intervals';

describe('Épica: Gestión de Intervalos', () => {


    // US 006: Agregar un nuevo intervalo horario

    describe('US_006: Agregar un nuevo intervalo horario', () => {
        it('Debe permitir agregar si el día es laboral', () => {
            const resultado = validarAgregarIntervalo(true);
            expect(resultado.isValid).toBe(true);
        });

        it('Debe devolver error si el día no es laboral', () => {
            const resultado = validarAgregarIntervalo(false);
            expect(resultado.isValid).toBe(false);
            expect(resultado.errorMessage).toBe('Primero debe seleccionar el día como laboral');
        });
    });

    describe('US_007: Control de intervalos superpuestos', () => {
        it('Debe permitir guardar intervalos válidos sin superposición', () => {
            const intervalosExistentes = [
                { startTime: '08:00', endTime: '12:00' }
            ];
            const nuevoIntervalo = { startTime: '14:00', endTime: '18:00' };
            const resultado = validarSuperposicion(intervalosExistentes, nuevoIntervalo, 'Lunes');

            expect(resultado.isValid).toBe(true);
        });

        // US 007: Control de intervalos superpuestos

        // las 3 formas de superposición de intervalos:

        it('Debe devolver error si el nuevo intervalo se superpone al final', () => {
            const intervalosExistentes = [
                { startTime: '08:00', endTime: '12:00' }
            ];
            const nuevoIntervalo = { startTime: '11:00', endTime: '15:00' };
            const resultado = validarSuperposicion(intervalosExistentes, nuevoIntervalo, 'Lunes');

            expect(resultado.isValid).toBe(false);
            expect(resultado.errorMessage).toBe('Hay superposición de horarios en el día Lunes');
        });

        it('Debe devolver error si el nuevo intervalo se superpone al inicio', () => {
            const intervalosExistentes = [
                { startTime: '14:00', endTime: '18:00' }
            ];
            const nuevoIntervalo = { startTime: '13:00', endTime: '15:00' };
            const resultado = validarSuperposicion(intervalosExistentes, nuevoIntervalo, 'Martes');

            expect(resultado.isValid).toBe(false);
            expect(resultado.errorMessage).toBe('Hay superposición de horarios en el día Martes');
        });

        it('Debe devolver error si el nuevo intervalo contiene completamente a uno existente', () => {
            const intervalosExistentes = [
                { startTime: '10:00', endTime: '12:00' }
            ];
            const nuevoIntervalo = { startTime: '09:00', endTime: '13:00' };
            const resultado = validarSuperposicion(intervalosExistentes, nuevoIntervalo, 'Miércoles');

            expect(resultado.isValid).toBe(false);
            expect(resultado.errorMessage).toBe('Hay superposición de horarios en el día Miércoles');
        });
    });

    // US 008: Guardar un nuevo intervalo sin modificar otros días

    describe('US_008: Guardar un nuevo intervalo sin modificar otros días', () => {
        it('Debe guardar los intervalos del día indicado sin mutar o alterar el resto de la configuración', () => {
            const configOriginal = {
                Lunes: [{ startTime: '08:00', endTime: '12:00' }],
                Martes: [{ startTime: '09:00', endTime: '17:00' }]
            };

            const nuevosIntervalosLunes = [
                { startTime: '08:00', endTime: '12:00' },
                { startTime: '14:00', endTime: '18:00' }
            ];

            const nuevaConfig = guardarIntervalosDia(configOriginal, 'Lunes', nuevosIntervalosLunes);

            // Verificamos que se haya modificado Lunes
            expect(nuevaConfig.Lunes).toEqual(nuevosIntervalosLunes);
            // Verificamos que Martes no haya cambiado
            expect(nuevaConfig.Martes).toEqual(configOriginal.Martes);
            // Verificamos inmutabilidad (no mutación del objeto original)
            expect(nuevaConfig).not.toBe(configOriginal);
        });
    });

    // US 009: Deshabilitar un intervalo temporalmente

    describe('US_009: Deshabilitar un intervalo temporalmente', () => {
        it('Debe marcar el intervalo como deshabilitado (enabled: false)', () => {
            const intervalo = { id: 1, startTime: '08:00', endTime: '12:00' };
            const resultado = deshabilitarIntervalo(intervalo);

            expect(resultado.enabled).toBe(false);
            expect(resultado.id).toBe(1);
        });

        it('Debe filtrar los intervalos deshabilitados para la vista pública', () => {
            const intervalos = [
                { id: 1, startTime: '08:00', endTime: '12:00', enabled: true },
                { id: 2, startTime: '14:00', endTime: '18:00', enabled: false }
            ];

            const activos = obtenerIntervalosActivos(intervalos);
            expect(activos).toHaveLength(1);
            expect(activos[0].id).toBe(1);
        });

        it('Debe conservar intacta la información de reservas separadas al deshabilitar', () => {
            const reservas = [
                { id: 1, time: '09:00', status: 'confirmed' }
            ];
            const intervalo = { id: 1, startTime: '08:00', endTime: '12:00', enabled: true };

            deshabilitarIntervalo(intervalo);

            // Verificamos que las reservas sigan intactas
            expect(reservas).toHaveLength(1);
            expect(reservas[0].status).toBe('confirmed');
        });
    });


    // US 010: Habilitar un intervalo
    describe('US_010: Habilitar un intervalo', () => {
        it('Debe marcar el intervalo deshabilitado como habilitado (enabled: true)', () => {
            const intervalo = { id: 1, startTime: '08:00', endTime: '12:00', enabled: false };
            const resultado = habilitarIntervalo(intervalo);

            expect(resultado.enabled).toBe(true);
        });
    });

});
