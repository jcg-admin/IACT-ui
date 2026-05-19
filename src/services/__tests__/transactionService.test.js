/**
 * transactionService.test.js — post-T5.2
 *
 * transactionGateway.js fue eliminado en T5.2.
 * El sistema /api/transaction/... no existe en IACT-api.
 * Los steppers que lo usaban migraron a useLocalTransaction (estado UI local).
 */
describe('T5.2 — transactionGateway eliminado', () => {
  test('transactionGateway.js no existe en src/services/', () => {
    const fs = require('fs')
    expect(fs.existsSync('src/services/transactionGateway.js')).toBe(false)
  })

  test('useTransaction.js no existe en src/hooks/domain/', () => {
    const fs = require('fs')
    expect(fs.existsSync('src/hooks/domain/useTransaction.js')).toBe(false)
  })

  test('ningún archivo de producción importa transactionGateway', () => {
    const { execSync } = require('child_process')
    // Buscar imports activos (no comentarios) de transactionGateway
    const result = execSync(
      "grep -r \"import.*transactionGateway\" src/ --include='*.js' --include='*.jsx' -l 2>/dev/null || true",
      { encoding: 'utf8' }
    ).trim()
    const lines = result.split('\n').filter(Boolean)
      .filter(f => !f.includes('__tests__') && !f.includes('.test.'))
    expect(lines).toEqual([])
  })

  test('ningún archivo de producción importa useTransaction', () => {
    const { execSync } = require('child_process')
    // Buscar imports activos (no comentarios)
    const result = execSync(
      "grep -rn \"from '@hooks/domain/useTransaction'\" src/ --include='*.js' --include='*.jsx' 2>/dev/null | grep -v useLocalTransaction || true",
      { encoding: 'utf8' }
    ).trim()
    const lines = result.split('\n').filter(Boolean)
      .filter(f => !f.includes('__tests__') && !f.includes('.test.'))
    expect(lines).toEqual([])
  })

  test('useLocalTransaction.js existe como sustituto de UI state puro', () => {
    const fs = require('fs')
    expect(fs.existsSync('src/hooks/domain/useLocalTransaction.js')).toBe(true)
  })

  test('steppers usan useLocalTransaction', () => {
    const fs = require('fs')
    const steppers = [
      'src/components/transaction/AssignFunctionStepper.jsx',
      'src/components/transaction/CreateUserStepper.jsx',
      'src/components/transaction/ExportCSVStepper.jsx',
    ]
    for (const path of steppers) {
      const src = fs.readFileSync(path, 'utf8')
      expect(src).toContain('useLocalTransaction')
      expect(src).not.toContain("from '@hooks/domain/useTransaction'")
    }
  })
})
