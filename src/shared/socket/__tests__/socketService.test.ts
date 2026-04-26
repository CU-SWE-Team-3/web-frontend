import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock socket.io-client
const mockOn = vi.fn()
const mockEmit = vi.fn()
const mockDisconnect = vi.fn().mockReturnThis()
const mockConnect = vi.fn()
const mockRemoveAllListeners = vi.fn()
const mockOff = vi.fn()
const mockIo = {
  on: vi.fn(),
}
const mockSocket = {
  on: mockOn,
  emit: mockEmit,
  disconnect: mockDisconnect,
  connect: mockConnect,
  connected: false,
  id: 'test-socket-id',
  removeAllListeners: mockRemoveAllListeners,
  off: mockOff,
  io: mockIo,
  auth: {},
}

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

// We need dynamic import since the module caches
let socketService: typeof import('../socketService')

describe('socketService', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset the cached socket by re-importing
    vi.resetModules()
    socketService = await import('../socketService')
  })

  afterEach(() => {
    socketService.disconnectSocket()
  })

  describe('getSocket', () => {
    it('should return null before connecting', () => {
      expect(socketService.getSocket()).toBeNull()
    })
  })

  describe('connectSocket', () => {
    it('should create a socket connection', () => {
      const socket = socketService.connectSocket()
      expect(socket).toBeDefined()
      expect(socket.on).toBeDefined()
    })

    it('should register connect event handler', () => {
      socketService.connectSocket()
      const connectCalls = mockOn.mock.calls.filter(c => c[0] === 'connect')
      expect(connectCalls.length).toBeGreaterThan(0)
    })

    it('should register disconnect event handler', () => {
      socketService.connectSocket()
      const disconnectCalls = mockOn.mock.calls.filter(c => c[0] === 'disconnect')
      expect(disconnectCalls.length).toBeGreaterThan(0)
    })

    it('should register connect_error event handler', () => {
      socketService.connectSocket()
      const errorCalls = mockOn.mock.calls.filter(c => c[0] === 'connect_error')
      expect(errorCalls.length).toBeGreaterThan(0)
    })

    it('should register error event handler', () => {
      socketService.connectSocket()
      const errorCalls = mockOn.mock.calls.filter(c => c[0] === 'error')
      expect(errorCalls.length).toBeGreaterThan(0)
    })
  })

  describe('disconnectSocket', () => {
    it('should disconnect and clear the socket', () => {
      socketService.connectSocket()
      socketService.disconnectSocket()
      expect(mockRemoveAllListeners).toHaveBeenCalled()
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('should be safe to call when no socket exists', () => {
      expect(() => socketService.disconnectSocket()).not.toThrow()
    })
  })
})
