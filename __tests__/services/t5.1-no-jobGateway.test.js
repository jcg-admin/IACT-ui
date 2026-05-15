/**
 * T5.1 RED: jobGateway.js debe ser eliminado.
 * Todos sus consumidores deben usar reportsGateway.
 */
describe('T5.1 — jobGateway eliminado', () => {
  test('jobGateway.js no existe en src/services/', () => {
    const fs = require('fs')
    expect(fs.existsSync('src/services/jobGateway.js')).toBe(false)
  })

  test('ningún archivo de producción importa jobGateway', () => {
    const { execSync } = require('child_process')
    // Buscar imports activos de jobGateway (no comentarios de documentación)
    const result = execSync(
      "grep -rn 'import.*jobGateway' src/ --include='*.js' --include='*.jsx' 2>/dev/null || true",
      { encoding: 'utf8' }
    ).trim()
    const lines = result.split('\n').filter(Boolean)
      .filter(f => !f.includes('__tests__') && !f.includes('.test.'))
    expect(lines).toEqual([])
  })

  test('JobOrchestrator usa reportsGateway en lugar de jobGateway', () => {
    const src = require('fs').readFileSync('src/facades/JobOrchestrator.js', 'utf8')
    expect(src).not.toContain('jobGateway')
    expect(src).toContain('reportsGateway')
  })

  test('useJobStatus usa reportsGateway en lugar de jobGateway', () => {
    const src = require('fs').readFileSync('src/hooks/domain/useJobStatus.js', 'utf8')
    expect(src).not.toContain('jobGateway')
  })

  test('useJobs usa reportsGateway en lugar de jobGateway', () => {
    const src = require('fs').readFileSync('src/hooks/domain/useJobs.js', 'utf8')
    expect(src).not.toContain('jobGateway')
  })
})
