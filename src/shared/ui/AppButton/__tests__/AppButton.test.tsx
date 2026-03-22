import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppButton } from '../AppButton'

describe('AppButton', () => {
  it('renders', () => {
    render(<AppButton>Click me</AppButton>)
    expect(screen.getByTestId('app-button')).toBeInTheDocument()
  })
})
