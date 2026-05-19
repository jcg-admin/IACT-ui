import WebSocketService from '../websocketGateway'

describe('WebSocketService — event system', () => {
  let ws

  beforeEach(() => {
    ws = new WebSocketService('ws://localhost:9999')
  })

  it('on registers a listener and emit calls it', () => {
    const handler = jest.fn()
    ws.on('message', handler)
    ws.emit('message', { type: 'ping' })
    expect(handler).toHaveBeenCalledWith({ type: 'ping' })
  })

  it('on returns an unsubscribe function', () => {
    const handler = jest.fn()
    const unsubscribe = ws.on('message', handler)
    unsubscribe()
    ws.emit('message', { type: 'ping' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('off removes the listener', () => {
    const handler = jest.fn()
    ws.on('data', handler)
    ws.off('data', handler)
    ws.emit('data', {})
    expect(handler).not.toHaveBeenCalled()
  })

  it('emit does nothing when no listeners registered', () => {
    expect(() => ws.emit('unregistered', {})).not.toThrow()
  })
})

describe('WebSocketService — isConnected', () => {
  it('returns false when socket is null', () => {
    const ws = new WebSocketService('ws://localhost:9999')
    expect(ws.isConnected()).toBeFalsy()
  })
})

describe('WebSocketService — initial state', () => {
  it('initializes with correct defaults', () => {
    const ws = new WebSocketService('ws://localhost:9999')
    expect(ws.maxReconnectAttempts).toBe(5)
    expect(ws.reconnectAttempts).toBe(0)
  })
})
