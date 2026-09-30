// Módulo: M04 - Booking Público
// Caso de prueba: CP_014 - Rechazo de confirmación por vencimiento del bloqueo temporal
// Integrante: Tomás Yanardi

describe('CP_014 - Rechazo de confirmación por timeout', () => {
  beforeEach(() => {
    // Arrange: Preparación inicial
    cy.visit('/');
    cy.get('[data-cy="tab-CP_013_014"]').click();
  });

  it('muestra mensaje de error cuando expira el tiempo de bloqueo de la reserva', () => {
    // Arrange: Seleccionar un horario (distinto para no pisar estado) y avanzar al formulario
    cy.contains('button', '10:30').click();
    cy.contains('button', 'Continuar').should('not.be.disabled').click();

    // Act: Simular la expiración del contador regresivo a 00:00
    cy.get('[data-cy="btn-simular-expiracion"]').click();

    // Assert: Verificar mensaje de expiración y botón de regreso
    cy.get('[data-cy="error-timeout"]')
      .should('be.visible')
      .and('contain', 'El tiempo para confirmar la reserva expiró');
      
    cy.get('[data-cy="btn-elegir-nuevo-horario"]').should('be.visible');
  });
});
