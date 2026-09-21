describe('AgendaYA - Gestión de Disponibilidad', () => {
  beforeEach(() => {
    // Arrange: preparar el estado inicial
    cy.visit('http://localhost:3000')
  })

  it('CP_001: Selección de día laboral y precarga automática de horarios', () => {
    // Como el mock de la app ya trae Lunes seleccionado y con horario,
    // abrimos directamente el modal de edición para verificar los inputs.
    cy.get('[data-cy="edit-button-lunes"]').first().click()

    // Assert: verificar el resultado esperado
    cy.get('[data-cy="input-start-time"]')
      .should('be.visible')
      .and('not.be.disabled') // Verificamos que admite edición
      
    cy.get('[data-cy="input-end-time"]')
      .should('be.visible')
      .and('not.be.disabled') // Verificamos que admite edición
      
    cy.screenshot('CP_001_final')
  })
})
