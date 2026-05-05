/**
 * transactionService Tests
 * 
 * Requerimientos:
 * - Usar apiService (no fetch directo)
 * - Enviar session_id header
 * - Enviar CSRF token
 * - Manejar errores correctamente
 * - Funcionar con mockInterceptor
 */

import transactionService from '@services/transactionService'
import apiService from '@services/apiService'

// Mock apiService
jest.mock('@services/apiService')

describe('transactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('start(_txType, _data)', () => {
    it('debería hacer POST a /api/transaction/start/', async () => {
      const _mockData = {
        transaction_id: 'tx-123',
        type: 'assign_function',
        total_steps: 3,
        conflicts: []
      }

      apiService.post.mockResolvedValue(_mockData)

      const _result = await transactionService.start('assign_function', { userId: 1 })

      expect(apiService.post).toHaveBeenCalledWith(
        '/api/transaction/start/',
        {
          type: 'assign_function',
          data: { userId: 1 }
        }
      )
      expect(_result).toEqual(_mockData)
    })

    it('debería retornar txId, type, totalSteps, conflicts', async () => {
      const _mockResponse = {
        transaction_id: 'tx-456',
        type: 'create_user',
        total_steps: 4,
        conflicts: [{ id: 'c1', field: 'email', message: 'Duplicate' }]
      }

      apiService.post.mockResolvedValue(_mockResponse)

      const _result = await transactionService.start('create_user', {})

      expect(_result.transaction_id).toBe('tx-456')
      expect(_result.type).toBe('create_user')
      expect(_result.total_steps).toBe(4)
      expect(_result.conflicts).toEqual([{ id: 'c1', field: 'email', message: 'Duplicate' }])
    })

    it('debería lanzar error si falla', async () => {
      const _error = new Error('Network error')
      apiService.post.mockRejectedValue(_error)

      await expect(
        transactionService.start('assign_function', {})
      ).rejects.toThrow('Network error')
    })
  })

  describe('step(_txId, _step, _stepData)', () => {
    it('debería hacer POST a /api/transaction/{txId}/step/', async () => {
      const _mockData = {
        step: 1,
        conflicts: [],
        errors: null
      }

      apiService.post.mockResolvedValue(_mockData)

      const _result = await transactionService.step('tx-123', 0, { field1: 'value1' })

      expect(apiService.post).toHaveBeenCalledWith(
        '/api/transaction/tx-123/step/',
        {
          step: 0,
          data: { field1: 'value1' }
        }
      )
      expect(_result).toEqual(_mockData)
    })

    it('debería retornar step, conflicts, errors', async () => {
      const _mockResponse = {
        step: 2,
        conflicts: [{ id: 'c2', field: 'role', message: 'SoD conflict' }],
        errors: null
      }

      apiService.post.mockResolvedValue(_mockResponse)

      const _result = await transactionService.step('tx-123', 1, {})

      expect(_result.step).toBe(2)
      expect(_result.conflicts).toHaveLength(1)
      expect(_result.errors).toBeNull()
    })
  })

  describe('confirm(_txId, _finalData)', () => {
    it('debería hacer POST a /api/transaction/{txId}/confirm/', async () => {
      const _mockData = {
        status: 'success',
        result: { id: 'user-1' }
      }

      apiService.post.mockResolvedValue(_mockData)

      const _result = await transactionService.confirm('tx-123', { email: 'test@example.com' })

      expect(apiService.post).toHaveBeenCalledWith(
        '/api/transaction/tx-123/confirm/',
        {
          data: { email: 'test@example.com' }
        }
      )
      expect(_result.status).toBe('success')
      expect(_result.result).toEqual({ id: 'user-1' })
    })
  })

  describe('cancel(_txId)', () => {
    it('debería hacer POST a /api/transaction/{txId}/cancel/', async () => {
      const _mockData = { status: 'cancelled' }

      apiService.post.mockResolvedValue(_mockData)

      const _result = await transactionService.cancel('tx-123')

      expect(apiService.post).toHaveBeenCalledWith(
        '/api/transaction/tx-123/cancel/',
        {}
      )
      expect(_result.status).toBe('cancelled')
    })
  })

  describe('resolveConflict(_txId, _conflictId, _resolution)', () => {
    it('debería hacer POST a /api/transaction/{txId}/conflict/{conflictId}/resolve/', async () => {
      const _mockData = {
        resolved: true,
        new_conflicts: []
      }

      apiService.post.mockResolvedValue(_mockData)

      const _result = await transactionService.resolveConflict(
        'tx-123',
        'conflict-1',
        { action: 'remove' }
      )

      expect(apiService.post).toHaveBeenCalledWith(
        '/api/transaction/tx-123/conflict/conflict-1/resolve/',
        { action: 'remove' }
      )
      expect(_result.resolved).toBe(true)
    })
  })

  describe('status(_txId)', () => {
    it('debería hacer GET a /api/transaction/{txId}/status/', async () => {
      const _mockData = {
        transaction_id: 'tx-123',
        step: 1,
        status: 'processing',
        data: {}
      }

      apiService.get.mockResolvedValue(_mockData)

      const _result = await transactionService.status('tx-123')

      expect(apiService.get).toHaveBeenCalledWith('/api/transaction/tx-123/status/')
      expect(_result.transaction_id).toBe('tx-123')
    })
  })
})
