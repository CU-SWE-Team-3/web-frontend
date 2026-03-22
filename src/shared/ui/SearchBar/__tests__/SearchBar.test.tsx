import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  it('renders', () => {
    render(<SearchBar />)
    expect(screen.getByTestId('navbar-search-input')).toBeInTheDocument()
  })
})
