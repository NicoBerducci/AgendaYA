import {
    deleteIntervalWithoutReservations,
    validateDeleteInterval,
    blockDayWithoutReservations,
    saveBlockReason,
    validateReservationsBeforeBlocking,
    cancelBlockWithReservations,
    unblockDay,
    getBlockedDayViewStatus,
} from './blocks';

describe('Épica: Mantenimiento de Intervalos y Bloqueos', () => {

    // Prueba 1: Basada en US_011 (Eliminar intervalo sin reservas asociadas)
    describe('US_011: Eliminar intervalo sin reservas asociadas', () => {
        it('Debe eliminar un intervalo sin reservas cuando el administrador confirma', () => {
            const intervals = [
                { id: 1, startTime: '08:00', endTime: '12:00' },
                { id: 2, startTime: '14:00', endTime: '18:00' },
            ];

            const result = deleteIntervalWithoutReservations(intervals, 1, true, 0);

            expect(result.isValid).toBe(true);
            expect(result.intervals).toHaveLength(1);
            expect(result.intervals[0].id).toBe(2);
        });

        it('Debe conservar el intervalo si el administrador cancela la eliminación', () => {
            const intervals = [
                { id: 1, startTime: '08:00', endTime: '12:00' },
            ];

            const result = deleteIntervalWithoutReservations(intervals, 1, false, 0);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Eliminación cancelada por el administrador');
            expect(result.intervals).toEqual(intervals);
        });
    });

    // Prueba 2: Basada en US_012 (Bloquear eliminación de intervalo con reservas activas)
    describe('US_012: Bloquear eliminación de intervalo con reservas activas', () => {
        it('Debe devolver error si el intervalo tiene reservas activas', () => {
            const result = validateDeleteInterval(3);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe(
                'No se puede eliminar el intervalo porque tiene reservas activas. Reservas afectadas: 3'
            );
        });

        it('Debe permitir la eliminación si el intervalo no tiene reservas activas', () => {
            const result = validateDeleteInterval(0);

            expect(result.isValid).toBe(true);
        });
    });

    // Prueba 3: Basada en US_013 (Bloquear un día sin reservas previas)
    describe('US_013: Bloquear un día sin reservas previas', () => {
        it('Debe bloquear una fecha futura sin reservas activas', () => {
            const day = {
                date: '2026-07-10',
                status: 'Disponible',
                activeReservations: 0,
            };

            const currentDate = new Date('2026-06-20');

            const result = blockDayWithoutReservations(day, currentDate, true);

            expect(result.isValid).toBe(true);
            expect(result.day.status).toBe('Bloqueado');
            expect(result.day.isPublicSelectable).toBe(false);
        });

        it('Debe devolver error si se intenta bloquear una fecha pasada', () => {
            const day = {
                date: '2026-06-10',
                status: 'Disponible',
                activeReservations: 0,
            };

            const currentDate = new Date('2026-06-20');

            const result = blockDayWithoutReservations(day, currentDate, true);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('No se pueden bloquear fechas pasadas');
        });
    });

    // Prueba 4: Basada en US_014 (Registrar motivo del bloqueo)
    describe('US_014: Registrar motivo del bloqueo', () => {
        it('Debe guardar el motivo interno del bloqueo cuando el administrador lo informa', () => {
            const day = {
                date: '2026-07-15',
                status: 'Bloqueado',
            };

            const result = saveBlockReason(day, 'Vacaciones');

            expect(result.status).toBe('Bloqueado');
            expect(result.blockReason).toBe('Vacaciones');
            expect(result.isReasonPublic).toBe(false);
        });

        it('Debe permitir guardar el bloqueo aunque el motivo esté vacío', () => {
            const day = {
                date: '2026-07-15',
                status: 'Bloqueado',
            };

            const result = saveBlockReason(day, '');

            expect(result.status).toBe('Bloqueado');
            expect(result.blockReason).toBe('');
        });
    });

    // Prueba 5: Basada en US_015 (Advertir reservas existentes al bloquear un día)
    describe('US_015: Advertir reservas existentes al bloquear un día', () => {
        it('Debe advertir si el día seleccionado tiene reservas activas', () => {
            const selectedDays = [
                { date: '2026-07-20', activeReservations: 2 },
                { date: '2026-07-21', activeReservations: 0 },
            ];

            const result = validateReservationsBeforeBlocking(selectedDays);

            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe(
                'Los siguientes días seleccionados tienen reservas activas: 2026-07-20'
            );
            expect(result.totalReservations).toBe(2);
        });

        it('Debe mostrar las opciones Cancelar la operación y Reagendar reservas', () => {
            const selectedDays = [
                { date: '2026-07-20', activeReservations: 1 },
            ];

            const result = validateReservationsBeforeBlocking(selectedDays);

            expect(result.actions).toEqual([
                'Cancelar la operación',
                'Reagendar reservas',
            ]);
        });
    });

    // Prueba 6: Basada en US_016 (Cancelar bloqueo ante advertencia)
    describe('US_016: Cancelar bloqueo ante advertencia', () => {
        it('Debe cancelar la operación y mantener las reservas si no se confirma', () => {
            const result = cancelBlockWithReservations(false);
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Operación cancelada. El día no se bloqueó y las reservas se mantienen activas.');
        });

        it('Debe devolver isValid true si el administrador confirma a pesar de la advertencia', () => {
            const result = cancelBlockWithReservations(true);
            expect(result.isValid).toBe(true);
        });
    });

    // Prueba 7: Basada en US_017 (Desbloquear un día bloqueado)
    describe('US_017: Desbloquear un día bloqueado', () => {
        it('Debe desbloquear el día correctamente y mostrar mensaje', () => {
            const day = { date: '2026-06-28', status: 'Bloqueado' };
            const result = unblockDay(day, true);
            expect(result.isValid).toBe(true);
            expect(result.successMessage).toBe('Los siguientes días fueron desbloqueados exitosamente: 2026-06-28');
            expect(result.day.status).toBe('Disponible');
            expect(result.day.isPublicSelectable).toBe(true);
        });

        it('Debe cancelar el desbloqueo y advertir sobre cambios sin guardar', () => {
            const day = { date: '2026-06-28', status: 'Bloqueado' };
            const result = unblockDay(day, false);
            expect(result.isValid).toBe(false);
            expect(result.errorMessage).toBe('Tiene cambios sin guardar. ¿Desea descartar los cambios y cambiar de modo?');
        });
    });

    // Prueba 8: Basada en US_018 (Visualizar días bloqueados)
    describe('US_018: Visualizar días bloqueados', () => {
        it('Debe marcar días pasados como no interactuables', () => {
            const currentDate = new Date('2026-06-20');
            const day = { date: '2026-06-10', status: 'Bloqueado' };
            const result = getBlockedDayViewStatus(day, currentDate);
            expect(result.isInteractable).toBe(false);
        });

        it('Debe marcar días futuros como interactuables', () => {
            const currentDate = new Date('2026-06-20');
            const day = { date: '2026-06-25', status: 'Bloqueado' };
            const result = getBlockedDayViewStatus(day, currentDate);
            expect(result.isInteractable).toBe(true);
        });
    });

});