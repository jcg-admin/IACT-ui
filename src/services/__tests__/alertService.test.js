/**
 * alertService Tests
 */

import alertService from '@services/alertService'
import apiService from '@services/apiService'

jest.mock('@services/apiService')

describe('alertService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getNew(_since)', () => {
    it('debería hacer GET a /api/alerts/', async () => {
      const _mockData = {
        alerts: [
          { id: 'a1', title: 'Alert 1', isRead: false }
        ]
      }

      apiService.get.mockResolvedValue(_mockData)

      const _result = await alertService.getNew()

      expect(apiService.get).toHaveBeenCalledWith('/api/alerts/')
      expect(_result.alerts).toHaveLength(1)
    })

    it('debería enviar since parameter si está', async () => {
      const _timestamp = '2026-01-01T00:00:00Z'
      const _mockData = { alerts: [] }

      apiService.get.mockResolvedValue(_mockData)

      await alertService.getNew(_timestamp)

      expect(apiService.get).toHaveBeenCalledWith('/api/alerts/?since=2026-01-01T00:00:00Z')
    })

    it('debería retornar array de alertas', async () => {
      const _mockData = {
        alerts: [
          { id: 'a1', title: 'Alert 1', severity: 'info', isRead: false },
          { id: 'a2', title: 'Alert 2', severity: 'warning', isRead: false }
        ]
      }

      apiService.get.mockResolvedValue(_mockData)

      const _result = await alertService.getNew()

      expect(Array.isArray(_result.alerts)).toBe(true)
      expect(_result.alerts).toHaveLength(2)
    })
  })
})
