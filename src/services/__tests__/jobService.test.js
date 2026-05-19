/**
 * jobService.test.js — post-T5.1
 *
 * jobGateway.js fue eliminado en T5.1.
 * La funcionalidad equivalente está en reportsGateway.js.
 * Este test verifica la eliminación y la redirección correcta.
 */

describe('T5.1 — jobGateway eliminado', () => {
  test('jobGateway.js no existe en src/services/', () => {
    const fs = require('fs')
    expect(fs.existsSync('src/services/jobGateway.js')).toBe(false)
  })

  test('JobOrchestrator usa reportsGateway', () => {
    const src = require('fs').readFileSync('src/facades/JobOrchestrator.js', 'utf8')
    expect(src).toContain('reportsGateway')
    expect(src).not.toContain("'@api/jobGateway'")
  })

  test('useJobStatus usa reportsService.getExportJobDetail', () => {
    const src = require('fs').readFileSync('src/hooks/domain/useJobStatus.js', 'utf8')
    expect(src).toContain('getExportJobDetail')
    expect(src).not.toContain("'@api/jobGateway'")
  })

  test('useJobs usa reportsService.cancelExport', () => {
    const src = require('fs').readFileSync('src/hooks/domain/useJobs.js', 'utf8')
    expect(src).toContain('cancelExport')
    expect(src).not.toContain("'@api/jobGateway'")
  })
})

describe('T5.1 — reportsGateway cubre la funcionalidad de jobs', () => {
  jest.mock('../reportsGateway', () => ({
    __esModule: true,
    default: {
      exportReport:        jest.fn().mockResolvedValue({ job_id: 'j-1' }),
      getExportJobDetail:  jest.fn().mockResolvedValue({ id: 'j-1', status: 'DONE', file_url: '/files/j-1.csv' }),
      cancelExport:        jest.fn().mockResolvedValue({}),
      getExportJobs:       jest.fn().mockResolvedValue([]),
    },
  }))

  const reportsService = require('../reportsGateway').default

  beforeEach(() => { jest.clearAllMocks() })

  test('exportReport() sustituye a jobService.start()', async () => {
    const result = await reportsService.exportReport('agents', 'csv', {})
    expect(result.job_id).toBe('j-1')
  })

  test('getExportJobDetail() sustituye a jobService.status()', async () => {
    const result = await reportsService.getExportJobDetail('j-1')
    expect(result.status).toBe('DONE')
    expect(result.file_url).toBeDefined()
  })

  test('cancelExport() sustituye a jobService.cancel()', async () => {
    await reportsService.cancelExport('j-1')
    expect(reportsService.cancelExport).toHaveBeenCalledWith('j-1')
  })
})
