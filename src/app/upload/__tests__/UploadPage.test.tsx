import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import apiClient from '../../../shared/api/client'
import UploadPage from '../page'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/upload',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock timers for recording and upload progress
vi.useFakeTimers()

// Mock navigator.mediaDevices for the recording test
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }]
    }),
  },
});

// Since jsdom doesn't have MediaRecorder or URL.createObjectURL, mock them
global.MediaRecorder = class {
  ondataavailable: any;
  onstop: any;
  constructor() {}
  start() {}
  stop() {
    this.onstop && this.onstop();
  }
} as any;

global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

import { tracksRepository } from '../../../features/tracks/api/tracksRepository'

// Mock the API client and axios to prevent real network requests
vi.mock('../../../shared/api/client', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    get: vi.fn()
  }
}))

vi.mock('../../../features/tracks/api/tracksRepository', () => ({
  tracksRepository: {
    uploadTrack: vi.fn().mockResolvedValue({ id: '123' }),
    getTracks: vi.fn().mockResolvedValue([]),
    getTracksByArtist: vi.fn().mockResolvedValue([])
  }
}))

// Mock wavesurfer
vi.mock('wavesurfer.js', () => ({
  default: {
    create: () => ({
      on: vi.fn(),
      load: vi.fn(),
      destroy: vi.fn(),
      getDuration: () => 100
    })
  }
}))

vi.mock('wavesurfer.js/dist/plugins/regions.esm.js', () => ({
  default: {
    create: () => ({
      on: vi.fn(),
      addRegion: vi.fn()
    })
  }
}))

describe('Upload Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  const createTestQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  })

  it('renders correctly', () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <UploadPage />
      </QueryClientProvider>
    )
    expect(screen.getByTestId('upload-page')).toBeInTheDocument()
    expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument()
    
    // Open recording accordion to reveal record button
    fireEvent.click(screen.getByText('Or record with a microphone'))
    expect(screen.getByTestId('upload-record-button')).toBeInTheDocument()
  })

  it('handles track recording flow', async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <UploadPage />
      </QueryClientProvider>
    )
    
    // Open recording accordion
    fireEvent.click(screen.getByText('Or record with a microphone'))
    
    // Start recording
    const recordBtn = screen.getByTestId('upload-record-button')
    
    await act(async () => {
      fireEvent.click(recordBtn)
      await Promise.resolve() // flush getUserMedia
    })
    
    // Advance time to mock recording duration
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    
    // Stop recording
    await act(async () => {
      fireEvent.click(recordBtn)
      await Promise.resolve() // flush any stop handlers if needed
    })
    
    // Should move to metadata form safely
    expect(screen.getByTestId('metadata-form')).toBeInTheDocument()
  })

  it('handles track upload via dropzone', async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <UploadPage />
      </QueryClientProvider>
    )
    
    const dropzone = screen.getByTestId('upload-dropzone-input')
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' })
    
    fireEvent.change(dropzone, { target: { files: [file] } })
    
    // Advance timers so the fake upload progress reaches 100% and triggers the form
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Should show progress and then metadata form
    expect(screen.getByTestId('metadata-form')).toBeInTheDocument()
  })

  it('submits metadata successfully and shows success modal', async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <UploadPage />
      </QueryClientProvider>
    )
    
    const dropzone = screen.getByTestId('upload-dropzone-input')
    const file = new File(['audio content'], 'test.mp3', { type: 'audio/mpeg' })
    fireEvent.change(dropzone, { target: { files: [file] } })

    // Advance timers for the form to appear
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByTestId('metadata-form')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('metadata-title-input'), {
      target: { value: 'New Track' }
    })
    
    const saveBtn = screen.getByTestId('metadata-save-button')
    
    await act(async () => {
      fireEvent.click(saveBtn)
      // Advance timers to trigger the 2000ms duration extraction timeout in the repository
      vi.advanceTimersByTime(2500)
      await Promise.resolve()
    })

    // Check if repository upload was called
    expect(tracksRepository.uploadTrack).toHaveBeenCalled()

    // Check if success modal appears
    expect(screen.getByTestId('upload-success-modal')).toBeInTheDocument()
  })
})
