import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ShareModal } from '../ShareModal'

const mockOnClose = vi.fn()

const server = setupServer(
  http.get('https://tinyurl.com/api-create.php', async ({ request }) => {
    return HttpResponse.text('https://tinyurl.com/abcxyz')
  })
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
})
afterAll(() => server.close())

let mockWriteText: any

describe('Share Modal', () => {
  beforeEach(() => {
    mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator.clipboard, { writeText: mockWriteText })
    vi.clearAllMocks()
  })

  it('does not render if closed', () => {
    render(<ShareModal open={false} onClose={mockOnClose} profileUrl="testuser" />)
    expect(screen.queryByTestId('share-modal')).not.toBeInTheDocument()
  })

  it('renders correctly with default URL', () => {
    render(<ShareModal open={true} onClose={mockOnClose} profileUrl="testuser" />)
    expect(screen.getByTestId('share-modal')).toBeInTheDocument()
    
    const urlInput = screen.getByTestId('share-modal-url-input') as HTMLInputElement
    expect(urlInput.value).toContain('https://biobeats.com/testuser')
    
    expect(screen.getByTestId('share-modal-twitter-button')).toBeInTheDocument()
    expect(screen.getByTestId('share-modal-facebook-button')).toBeInTheDocument()
  })

  it('copies to clipboard on copy click', async () => {
    const user = userEvent.setup()
    render(<ShareModal open={true} onClose={mockOnClose} profileUrl="testuser" />)
    
    const copyBtn = screen.getByTestId('share-modal-copy-button')
    await user.click(copyBtn)
    
    expect(copyBtn).toHaveTextContent('Copied!')
    expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('https://biobeats.com/testuser'))
  })

  it('calls TinyURL when shorten checkbox is checked', async () => {
    const user = userEvent.setup()
    render(<ShareModal open={true} onClose={mockOnClose} profileUrl="testuser" />)
    
    const checkbox = screen.getByTestId('share-modal-shorten-checkbox')
    await user.click(checkbox)
    
    await waitFor(() => {
      const urlInput = screen.getByTestId('share-modal-url-input') as HTMLInputElement
      expect(urlInput.value).toBe('https://tinyurl.com/abcxyz')
    })
  })

  it('restores original URL when shorten checkbox is unchecked', async () => {
    const user = userEvent.setup()
    render(<ShareModal open={true} onClose={mockOnClose} profileUrl="testuser" />)
    
    const checkbox = screen.getByTestId('share-modal-shorten-checkbox')
    await user.click(checkbox) // Check
    
    await waitFor(() => {
      expect((screen.getByTestId('share-modal-url-input') as HTMLInputElement).value).toBe('https://tinyurl.com/abcxyz')
    })
    
    await user.click(checkbox) // Uncheck
    
    await waitFor(() => {
      const urlInput = screen.getByTestId('share-modal-url-input') as HTMLInputElement
      expect(urlInput.value).toContain('https://biobeats.com/testuser')
    })
  })
})
