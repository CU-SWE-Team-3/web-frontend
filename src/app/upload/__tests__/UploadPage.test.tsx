import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UploadPage from '../page'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))

// Mock timers for recording and upload progress
vi.useFakeTimers()

describe('Upload Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  it('renders correctly', () => {
    render(<UploadPage />)
    expect(screen.getByTestId('upload-page')).toBeInTheDocument()
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
    expect(screen.getByTestId('upload-record-button')).toBeInTheDocument()
  })

  it('handles track recording flow', async () => {
    render(<UploadPage />)
    
    // Start recording
    const recordBtn = screen.getByTestId('upload-record-button')
    fireEvent.click(recordBtn)
    
    // Check if recording state is active
    expect(screen.getByTestId('upload-record-timer')).toBeInTheDocument()
    
    // Advance time and check timer
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    
    // Stop recording
    fireEvent.click(recordBtn)
    
    // Should move to metadata form
    await waitFor(() => {
      expect(screen.getByTestId('metadata-form')).toBeInTheDocument()
    })
  })

  it('handles track upload via dropzone', async () => {
    render(<UploadPage />)
    
    const dropzone = screen.getByTestId('upload-dropzone-input')
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' })
    
    fireEvent.change(dropzone, { target: { files: [file] } })
    
    // Should show progress and then metadata form
    await waitFor(() => {
      expect(screen.getByTestId('metadata-form')).toBeInTheDocument()
    })
  })

  it('submits metadata successfully', async () => {
    render(<UploadPage />)
    
    // Bypass dropzone by triggering record stop simulation if possible, 
    // or just simulate the file drop
    const dropzone = screen.getByTestId('upload-dropzone-input')
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' })
    fireEvent.change(dropzone, { target: { files: [file] } })

    await waitFor(() => screen.getByTestId('metadata-form'))

    fireEvent.change(screen.getByTestId('metadata-title-input'), {
      target: { value: 'New Track' }
    })
    
    const saveBtn = screen.getByTestId('metadata-save-button')
    fireEvent.click(saveBtn)

    // Check if navigation happens after upload
    await waitFor(() => {
      // Assuming it pushes to profile or feed
      expect(mockPush).toHaveBeenCalled()
    }, { timeout: 3000 })
  })
})
