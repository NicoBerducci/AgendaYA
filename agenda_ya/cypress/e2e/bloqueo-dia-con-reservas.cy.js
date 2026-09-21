// Módulo: M02 - Gestión de Disponibilidad
// Caso de prueba: CP_006 - Intentar bloquear un día con reservas activas (flujo de error)
// Integrante: Adriel

// Calcula, en runtime, la fecha F+10 usando los mismos componentes de fecha
// local (año-mes-día) que usa el calendario de BlockDayConfig para generar
// sus data-cy. scheduleService.ts siembra ese mismo día (hoy + 10) con 5
// reservas activas para poder reproducir este escenario de error.
function fechaISOEnRuntime(diasEnElFuturo) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasEnElFuturo);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

describe('CP_006 - Intento de bloqueo de un día con reservas activas (Adriel)', () => {
  it('rechaza el bloqueo del día F+10 y ofrece cancelar o reagendar', () => {
    // Arrange
    const fechaF10 = fechaISOEnRuntime(10);

    cy.visit('/');
    cy.get('[data-cy="tab-CP_005"]').click();
    cy.get('[data-cy="panel-lateral"]').should('contain', 'No hay fechas seleccionadas');

    // Si F+10 cruza a otro mes, navegamos el calendario antes de buscar el día — mismo tipo de bug que las fechas hardcodeadas, ver informe TP6
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 7);
    const fechaDestino = new Date();
    fechaDestino.setDate(fechaDestino.getDate() + 10);
    const diffMeses = (fechaDestino.getFullYear() - fechaInicio.getFullYear()) * 12 + (fechaDestino.getMonth() - fechaInicio.getMonth());
    
    for (let i = 0; i < diffMeses; i++) {
      cy.get('[data-cy="mes-siguiente"]').click();
    }

    // Act
    cy.get(`[data-cy="dia-${fechaF10}"]`).click();
    cy.get('[data-cy="btn-guardar"]').click();

    cy.get('[data-cy="modal-confirmar-bloqueo"]').should('be.visible');
    cy.get('[data-cy="modal-confirmar-bloqueo-si"]').click();

    // Assert
    cy.get('[data-cy="alert-modal"]').should('contain', 'reservas activas');
    cy.get('[data-cy="btn-cancelar-operacion"]').should('be.visible');
    cy.get('[data-cy="btn-reagendar-reservas"]').should('be.visible');
  });
});
