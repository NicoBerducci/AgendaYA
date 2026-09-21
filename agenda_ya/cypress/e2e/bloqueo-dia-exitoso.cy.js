// Módulo: M02 - Gestión de Disponibilidad
// Caso de prueba: CP_005 - Bloquear un día sin reservas previas (flujo feliz)
// Integrante: Adriel

// Calcula, en runtime, la fecha F+7 usando los mismos componentes de fecha
// local (año-mes-día) que usa el calendario de BlockDayConfig para generar
// sus data-cy (evita el problema de fechas hardcodeadas que ya afectó a
// este proyecto).
function fechaISOEnRuntime(diasEnElFuturo) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasEnElFuturo);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

describe('CP_005 - Bloqueo de un día sin reservas previas (Adriel)', () => {
  it('bloquea el día F+7 y lo oculta de la vista pública', () => {
    // Arrange
    const fechaF7 = fechaISOEnRuntime(7);

    cy.visit('/');
    cy.get('[data-cy="tab-CP_005"]').click();

    cy.get('[data-cy="estado-interno"]').should('contain', 'Disponible');
    cy.get('[data-cy="panel-lateral"]').should('contain', 'No hay fechas seleccionadas');

    // Act
    cy.get(`[data-cy="dia-${fechaF7}"]`).click();
    cy.get(`[data-cy="input-motivo-${fechaF7}"]`).type('Feriado de prueba (E2E)');
    cy.get('[data-cy="btn-guardar"]').click();

    cy.get('[data-cy="modal-confirmar-bloqueo"]').should('be.visible');
    cy.get('[data-cy="modal-confirmar-bloqueo-si"]').click();

    // Assert
    cy.get('[data-cy="alert-modal"]').should(
      'contain',
      `Los siguientes días fueron bloqueados exitosamente: ${fechaF7}`
    );

    cy.get('[data-cy="alert-modal-cerrar"]').click();
    cy.get('[data-cy="alert-modal"]').should('not.exist');

    cy.get('[data-cy="panel-lateral"]').should('contain', 'No hay fechas seleccionadas');
    cy.get('[data-cy="estado-interno"]').should('contain', 'Bloqueado');
    cy.get('[data-cy="vista-publica"]').should('contain', 'No seleccionable');
  });
});
