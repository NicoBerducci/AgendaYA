/**
 * US_011: Elimina un intervalo sin reservas asociadas si el administrador confirma la acción
 */
export const deleteIntervalWithoutReservations = (
    intervals,
    intervalId,
    hasConfirmed,
    activeReservations
) => {
    if (!hasConfirmed) {
        return {
            isValid: false,
            errorMessage: 'Eliminación cancelada por el administrador',
            intervals,
        };
    }

    if (activeReservations > 0) {
        return {
            isValid: false,
            errorMessage: 'No se puede eliminar el intervalo porque tiene reservas activas',
            intervals,
        };
    }

    return {
        isValid: true,
        intervals: intervals.filter((interval) => interval.id !== intervalId),
    };
};

/**
 * US_012: Valida que no se pueda eliminar un intervalo con reservas activas
 */
export const validateDeleteInterval = (activeReservations) => {
    if (activeReservations > 0) {
        return {
            isValid: false,
            errorMessage: `No se puede eliminar el intervalo porque tiene reservas activas. Reservas afectadas: ${activeReservations}`,
        };
    }

    return { isValid: true };
};

/**
 * US_016: Cancelar bloqueo ante advertencia
 */
export const cancelBlockWithReservations = (hasConfirmed) => {
    if (!hasConfirmed) {
        return {
            isValid: false,
            errorMessage: 'Operación cancelada. El día no se bloqueó y las reservas se mantienen activas.',
        };
    }
    return { isValid: true };
};

/**
 * US_017: Desbloquear un día bloqueado
 */
export const unblockDay = (day, hasConfirmed) => {
    if (!hasConfirmed) {
        return {
            isValid: false,
            errorMessage: 'Tiene cambios sin guardar. ¿Desea descartar los cambios y cambiar de modo?',
            day
        };
    }
    return {
        isValid: true,
        successMessage: `Los siguientes días fueron desbloqueados exitosamente: ${day.date}`,
        day: {
            ...day,
            status: 'Disponible',
            isPublicSelectable: true
        }
    };
};

/**
 * US_018: Visualizar días bloqueados
 */
export const getBlockedDayViewStatus = (day, currentDate) => {
    const selectedDate = new Date(`${day.date}T00:00:00`);
    const today = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
    );

    if (selectedDate < today) {
        return {
            ...day,
            isInteractable: false
        };
    }

    return {
        ...day,
        isInteractable: true
    };
};

/**
 * US_013: Bloquea un día futuro sin reservas activas
 */
export const blockDayWithoutReservations = (day, currentDate, hasConfirmed) => {
    const selectedDate = new Date(`${day.date}T00:00:00`);

    const today = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
    );

    if (selectedDate < today) {
        return {
            isValid: false,
            errorMessage: 'No se pueden bloquear fechas pasadas',
            day,
        };
    }

    if (!hasConfirmed) {
        return {
            isValid: false,
            errorMessage: 'Bloqueo cancelado por el administrador',
            day,
        };
    }

    if (day.activeReservations > 0) {
        return {
            isValid: false,
            errorMessage: 'El día tiene reservas activas',
            day,
        };
    }

    return {
        isValid: true,
        day: {
            ...day,
            status: 'Bloqueado',
            isPublicSelectable: false,
        },
    };
};

/**
 * US_014: Registra el motivo interno del bloqueo de un día
 */
export const saveBlockReason = (day, reason) => {
    return {
        ...day,
        status: 'Bloqueado',
        blockReason: reason,
        isReasonPublic: false,
    };
};

/**
 * US_015: Advierte si se intenta bloquear un día con reservas activas
 */
export const validateReservationsBeforeBlocking = (selectedDays) => {
    const daysWithReservations = selectedDays.filter(
        (day) => day.activeReservations > 0
    );

    if (daysWithReservations.length > 0) {
        const daysList = daysWithReservations.map((day) => day.date).join(', ');

        const totalReservations = daysWithReservations.reduce(
            (total, day) => total + day.activeReservations,
            0
        );

        return {
            isValid: false,
            errorMessage: `Los siguientes días seleccionados tienen reservas activas: ${daysList}`,
            totalReservations,
            actions: ['Cancelar la operación', 'Reagendar reservas'],
        };
    }

    return { isValid: true };
};