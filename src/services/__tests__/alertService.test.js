/**
 * alertService.test.js — post-T5.3
 *
 * alertGateway.js fue eliminado en T5.3.
 * alertGateway tenía 1 método: getNew(since) → GET /api/alerts/ (URL incorrecta).
 * La funcionalidad está cubierta por alertsGateway.getAlerts() → GET /api/alerts/active/
 */
describe('T5.3 — alertGateway eliminado (consolidado en alertsGateway)', () => {
  test('alertGateway.js no existe en src/services/', () => {
    const fs = require('fs')
    expect(fs.existsSync('src/services/alertGateway.js')).toBe(false)
  })

  test('alertsGateway.getAlerts() cubre la funcionalidad de alertGateway.getNew()', () => {
    const alertsGateway = require('../alertsGateway').default
    expect(typeof alertsGateway.getAlerts).toBe('function')
    expect(typeof alertsGateway.getActiveAlerts).toBe('function')
  })

  test('ningún archivo de producción importa alertGateway (distinto de alertsGateway)', () => {
    const { execSync } = require('child_process')
    const result = execSync(
      "grep -r \"from.*alertGateway'\" src/ --include='*.js' --include='*.jsx' -l 2>/dev/null || true",
      { encoding: 'utf8' }
    ).trim()
    // Excluir alertsGateway.js (es el correcto) y tests
    const lines = result.split('\n').filter(Boolean)
      .filter(f => !f.includes('alertsGateway') && !f.includes('__tests__') && !f.includes('.test.'))
    expect(lines).toEqual([])
  })
})
