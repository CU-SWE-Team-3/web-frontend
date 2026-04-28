import { io, Socket } from 'socket.io-client'

// ─── Socket Service Singleton ──────────────────────────────────────────────────
// Manages a single Socket.IO connection for the entire app.
// Uses the JWT from localStorage for authentication.

let socket: Socket | null = null

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:8000'

/**
 * Get or create the socket instance.
 * Does NOT connect automatically — call `connectSocket()` to start.
 */
export function getSocket(): Socket | null {
  return socket
}

/**
 * Connect to the Socket.IO server with the current JWT token.
 * If already connected, disconnects first and reconnects with fresh token.
 */
export function connectSocket(): Socket {
  // If socket exists and is connected, return it
  if (socket?.connected) return socket

  // Get token from localStorage
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null

  // Disconnect old socket if it exists
  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io(SOCKET_URL, {
    auth: { token: token ?? '' },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true,
  })

  // ── Connection lifecycle logging ──────────────────────────────────────────
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
  })

  socket.on('disconnect', (reason) => {
    console.warn('[Socket] Disconnected:', reason)
    if (reason === 'io server disconnect') {
      // Server forcefully disconnected — reconnect manually
      socket?.connect()
    }
  })

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message)
    if (err.message.includes('Invalid token')) {
      handleTokenRefresh()
    }
  })

  socket.io.on('reconnect', (attemptNumber) => {
    console.log('[Socket] Reconnected after', attemptNumber, 'attempt(s)')
  })

  socket.io.on('reconnect_failed', () => {
    console.error('[Socket] All reconnection attempts failed')
  })

  socket.on('error', (err: { message: string }) => {
    console.error('[Socket] Error:', err.message)
  })

  return socket
}

/**
 * Disconnect from the Socket.IO server cleanly.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

/**
 * Reconnect with a fresh token after a token refresh.
 */
async function handleTokenRefresh(): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'
    const axios = (await import('axios')).default
    const response = await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true })
    const newToken = response.data?.data?.accessToken || response.data?.accessToken
    if (newToken && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newToken)
      if (socket) {
        socket.auth = { token: newToken }
        socket.disconnect().connect()
      }
    }
  } catch {
    console.error('[Socket] Token refresh failed')
  }
}
