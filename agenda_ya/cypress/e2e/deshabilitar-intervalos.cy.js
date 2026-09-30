// Módulo: M02 - Gestión de Disponibilidad
// Caso de prueba: CP_003 / CP_004 - Deshabilitar intervalos y superposición
// Integrante: Bomprezzi Paula

describe('AgendaYA - Gestión de Disponibilidad', () => {
  beforeEach(() => {
    // Arrange: preparar el estado inicial
    cy.visit('http://localhost:3000')
  })

  it('CP_003: Deshabilitar un intervalo temporalmente y rehabilitarlo', () => {
    // Act: Deshabilitar el intervalo del Miércoles Turno 1
    cy.get('[data-cy="btn-deshabilitar-miércoles-0"]').click()

    // Assert: Verificar popup de éxito al deshabilitar
    cy.contains('Se deshabilitó el intervalo del turno Turno 1 del día Miércoles exitosamente').should('be.visible')
    cy.contains('button', 'OK').click()

    // Act: Rehabilitarlo
    cy.get('[data-cy="btn-habilitar-miércoles-0"]').click()

    // Assert: Verificar popup de éxito al habilitar
    cy.contains('Se habilitó el intervalo del turno Turno 1 del día Miércoles exitosamente').should('be.visible')
    cy.contains('button', 'OK').click()

    cy.screenshot('CP_003_final')
  })

  it('CP_004: Control de intervalos superpuestos', () => {
    // Act: Agregar un nuevo turno
    cy.get('[data-cy="btn-agregar-turno"]').click()

    // El modal abre con Lunes, 11:00 a 15:00 por defecto, el cual se solapa con 08:00 a 12:00
    // Guardamos en el modal
    cy.get('[data-cy="button-save-modal"]').click()

    // Guardamos la configuración global
    cy.get('[data-cy="button-save-workday"]').click()

    // Assert: Verificar error por superposición
    cy.contains('Hay superposición de horarios en el día Lunes').should('be.visible')
    cy.contains('button', 'OK').click()

    cy.screenshot('CP_004_final')
  })
})
