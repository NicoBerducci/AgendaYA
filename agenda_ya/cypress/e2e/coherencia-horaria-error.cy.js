describe('AgendaYA - Gestión de Disponibilidad', () => {
  beforeEach(() => {
    // Arrange: preparar el estado inicial
    cy.visit('http://localhost:3000')
    
    // Configurar Lunes (el mock ya lo trae seleccionado, así que editamos directo)
    cy.get('[data-cy="edit-button-lunes"]').first().click()
    cy.get('[data-cy="input-start-time"]').clear().type('08:00')
    cy.get('[data-cy="input-end-time"]').clear().type('16:00')
    cy.get('[data-cy="button-save-modal"]').click()
    // Guardado global para confirmar que está persistido
    cy.get('[data-cy="button-save-workday"]').click()
    
    // El guardado exitoso siempre lanza un modal de confirmación, así que lo cerramos
    cy.contains('button', 'OK').click()
  })

  it('CP_002: Validación de coherencia horaria incorrecta (fin menor a inicio)', () => {
    // Act: ejecutar la acción principal
    // Abrimos para editar el lunes guardado
    cy.get('[data-cy="edit-button-lunes"]').click()
    cy.get('[data-cy="input-start-time"]').clear().type('18:00')
    cy.get('[data-cy="input-end-time"]').clear().type('09:00')
    cy.get('[data-cy="button-save-modal"]').click()

    // Assert: verificar el resultado esperado
    // 1. Interrupción de guardado y muestra de mensaje
    cy.get('[data-cy="modal-error-message"]')
      .should('be.visible')
      .and('contain', 'El horario de fin debe ser posterior al de inicio en el día Lunes')
    
    // 2. Conservación de la configuración previa
    // Cerramos el modal de error
    cy.contains('button', 'OK').click()
    
    // Cerramos el modal de edición para descartar cambios
    cy.get('[data-cy="button-cancel-modal"]').click()
    
    // Volvemos a abrir para verificar qué se conservó
    cy.get('[data-cy="edit-button-lunes"]').first().click()
    cy.get('[data-cy="input-start-time"]').should('have.value', '08:00')
    cy.get('[data-cy="input-end-time"]').should('have.value', '16:00')
    
    cy.screenshot('CP_002_final')
  })
})
