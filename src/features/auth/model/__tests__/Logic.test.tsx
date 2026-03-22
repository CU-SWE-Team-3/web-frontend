import { it, expect } from 'vitest'
import { useAuthStore } from '../useAuthStore'

it('works with store', () => {
    useAuthStore.setState({ isAuthenticated: true })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
})
