// Módulo: M04 - Booking Público
// Caso de prueba: CP_013 - Confirmación exitosa de reserva (Flujo feliz)
// Integrante: Tomás Yanardi

describe('CP_013 - Confirmación de reserva exitosa', () => {
  beforeEach(() => {
    // Arrange: Preparación inicial
    cy.visit('/');
    cy.get('[data-cy="tab-CP_013_014"]').click();
  });

  it('permite seleccionar un horario, llenar los datos y confirmar la reserva', () => {
    // Arrange: Seleccionar un horario disponible y avanzar al formulario
    cy.contains('button', '10:00').click();
    cy.contains('button', 'Continuar').should('not.be.disabled').click();

    // Act: Llenar los campos de datos personales y confirmar
    cy.get('[data-cy="input-nombre"]').clear().type('Tomás Yanardi');
    cy.get('[data-cy="input-email"]').clear().type('tomas.yanardi@gmail.com');
    cy.get('[data-cy="input-telefono"]').clear().type('2604123456');
    cy.get('[data-cy="btn-confirmar-reserva"]').click();

    // Assert: Verificar mensaje de éxito y datos del resumen
    cy.get('[data-cy="reserva-exitosa"]').should('be.visible');
    cy.get('[data-cy="resumen-nombre"]').should('contain', 'Tomás Yanardi');
    cy.get('[data-cy="resumen-evento"]').should('contain', 'Consulta general');
  });
});
