import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NavBar } from '../NavBar'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('NavBar', () => {
  it('renders', () => {
    render(<NavBar />)
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })
})
