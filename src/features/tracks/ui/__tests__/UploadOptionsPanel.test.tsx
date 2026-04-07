import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock wavesurfer.js — the ExcerptSelector uses it
vi.mock('wavesurfer.js', () => {
  const create = vi.fn(() => ({
    on: vi.fn(),
    load: vi.fn(),
    destroy: vi.fn(),
    getDuration: vi.fn(() => 120),
  }))
  return { default: { create } }
})

vi.mock('wavesurfer.js/dist/plugins/regions.esm.js', () => {
  const createPlugin = vi.fn(() => ({
    on: vi.fn(),
    addRegion: vi.fn(),
  }))
  return { default: { create: createPlugin } }
})

import UploadOptionsPanel from '../UploadOptionsPanel'

describe('UploadOptionsPanel', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderPanel = (props = {}) =>
    render(
      <UploadOptionsPanel
        audioFile={null}
        artistName="Test Artist"
        onChange={mockOnChange}
        {...props}
      />
    )

  // ─── Rendering ──────────────────────────────────────────────────────────

  it('renders the panel with Options heading', () => {
    renderPanel()
    expect(screen.getByTestId('upload-options-panel')).toBeInTheDocument()
    expect(screen.getByText('Options')).toBeInTheDocument()
  })

  it('renders all three tab buttons', () => {
    renderPanel()
    expect(screen.getByTestId('options-tab-metadata')).toBeInTheDocument()
    expect(screen.getByTestId('options-tab-permissions')).toBeInTheDocument()
    expect(screen.getByTestId('options-tab-advanced')).toBeInTheDocument()
  })

  it('shows Metadata tab by default', () => {
    renderPanel()
    expect(screen.getByTestId('options-metadata-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('options-permissions-tab')).not.toBeInTheDocument()
    expect(screen.queryByTestId('options-advanced-tab')).not.toBeInTheDocument()
  })

  // ─── Tab Switching ──────────────────────────────────────────────────────

  it('switches to Permissions tab', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))
    expect(screen.getByTestId('options-permissions-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('options-metadata-tab')).not.toBeInTheDocument()
  })

  it('switches to Advanced tab', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-advanced'))
    expect(screen.getByTestId('options-advanced-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('options-metadata-tab')).not.toBeInTheDocument()
  })

  it('switches back to Metadata tab', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))
    fireEvent.click(screen.getByTestId('options-tab-metadata'))
    expect(screen.getByTestId('options-metadata-tab')).toBeInTheDocument()
  })

  // ─── Metadata Tab — Input Binding ───────────────────────────────────────

  it('pre-fills the artist field from artistName prop', () => {
    renderPanel({ artistName: 'DJ Shadow' })
    const input = screen.getByTestId('options-artist') as HTMLInputElement
    expect(input.value).toBe('DJ Shadow')
  })

  it('updates artist field and fires onChange', () => {
    renderPanel()
    const input = screen.getByTestId('options-artist')
    fireEvent.change(input, { target: { value: 'New Artist' } })
    expect(mockOnChange).toHaveBeenCalled()
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.artist).toBe('New Artist')
  })

  it('updates publisher field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-publisher'), { target: { value: 'Acme Records' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.publisher).toBe('Acme Records')
  })

  it('updates ISRC field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-isrc'), { target: { value: 'USS1Z1001234' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.isrc).toBe('USS1Z1001234')
  })

  it('updates composer field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-composer'), { target: { value: 'Mozart' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.composer).toBe('Mozart')
  })

  it('updates release title field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-release-title'), { target: { value: 'My EP' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.releaseTitle).toBe('My EP')
  })

  it('updates buy-link field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-buy-link'), { target: { value: 'https://store.com' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.buyLink).toBe('https://store.com')
  })

  it('switches buyLinkType to storefront', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-buy-link-radio-storefront'))
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.buyLinkType).toBe('storefront')
  })

  it('updates album title field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-album-title'), { target: { value: 'Greatest Hits' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.albumTitle).toBe('Greatest Hits')
  })

  it('updates record label field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-record-label'), { target: { value: 'Sony' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.recordLabel).toBe('Sony')
  })

  it('updates release date field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-release-date'), { target: { value: '2026-06-15' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.releaseDate).toBe('2026-06-15')
  })

  it('updates barcode field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-barcode'), { target: { value: '012345678905' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.barcode).toBe('012345678905')
  })

  it('updates ISWC field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-iswc'), { target: { value: 'T-034.524.680-1' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.iswc).toBe('T-034.524.680-1')
  })

  it('updates P line field', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-p-line'), { target: { value: '2007 XYZ Records' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.pLine).toBe('2007 XYZ Records')
  })

  it('changes contains music select', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-contains-music'), { target: { value: 'No' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.containsMusic).toBe('No')
  })

  it('changes explicit content select', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-explicit-content'), { target: { value: 'Yes' } })
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.explicitContent).toBe('Yes')
  })

  it('switches license to Creative Commons', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-license-cc'))
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.licenseType).toBe('creative-commons')
  })

  it('switches license back to All Rights Reserved', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-license-cc'))
    fireEvent.click(screen.getByTestId('options-license-all-rights'))
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.licenseType).toBe('all-rights-reserved')
  })

  // ─── Permissions Tab — Toggle Binding ───────────────────────────────────

  it('toggles "Allow comments" off (default on)', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))

    const toggle = screen.getByTestId('options-toggle-comments')
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(toggle)
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.allowComments).toBe(false)
  })

  it('toggles "Display stats" off (default on)', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))

    const toggle = screen.getByTestId('options-toggle-stats')
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(toggle)
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.displayStats).toBe(false)
  })

  it('toggles "Enable downloads" on (default off)', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))

    const toggle = screen.getByTestId('options-toggle-downloads')
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(toggle)
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.enableDownloads).toBe(true)
  })

  it('toggles "Enable Content ID" on (default off)', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))

    const toggle = screen.getByTestId('options-toggle-content-id')
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(toggle)
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.enableContentId).toBe(true)
  })

  it('toggles "Include in RSS" off (default on)', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))

    const toggle = screen.getByTestId('options-toggle-rss')
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(toggle)
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.includeInRss).toBe(false)
  })

  it('checks the copyright confirmation checkbox', () => {
    renderPanel()
    fireEvent.click(screen.getByTestId('options-tab-permissions'))

    const checkbox = screen.getByTestId('options-copyright-checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)

    fireEvent.click(checkbox)
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
    expect(lastCall.copyrightConfirmed).toBe(true)
  })

  // ─── Advanced Tab ───────────────────────────────────────────────────────

  it('shows placeholder when no audio file on Advanced tab', () => {
    renderPanel({ audioFile: null })
    fireEvent.click(screen.getByTestId('options-tab-advanced'))
    expect(screen.getByText(/Upload an audio file first/)).toBeInTheDocument()
  })

  it('renders excerpt waveform container when audio file is provided', () => {
    const file = new File(['audio'], 'test.mp3', { type: 'audio/mpeg' })
    renderPanel({ audioFile: file })
    fireEvent.click(screen.getByTestId('options-tab-advanced'))
    expect(screen.getByTestId('excerpt-waveform')).toBeInTheDocument()
  })

  // ─── Full onChange payload ──────────────────────────────────────────────

  it('sends a complete UploadOptionsData object on every change', () => {
    renderPanel()
    fireEvent.change(screen.getByTestId('options-artist'), { target: { value: 'Test' } })

    const payload = mockOnChange.mock.calls[0][0]
    // Verify all expected keys exist
    expect(payload).toHaveProperty('containsMusic')
    expect(payload).toHaveProperty('artist')
    expect(payload).toHaveProperty('publisher')
    expect(payload).toHaveProperty('isrc')
    expect(payload).toHaveProperty('composer')
    expect(payload).toHaveProperty('releaseTitle')
    expect(payload).toHaveProperty('buyLinkType')
    expect(payload).toHaveProperty('buyLink')
    expect(payload).toHaveProperty('albumTitle')
    expect(payload).toHaveProperty('recordLabel')
    expect(payload).toHaveProperty('releaseDate')
    expect(payload).toHaveProperty('barcode')
    expect(payload).toHaveProperty('iswc')
    expect(payload).toHaveProperty('pLine')
    expect(payload).toHaveProperty('explicitContent')
    expect(payload).toHaveProperty('licenseType')
    expect(payload).toHaveProperty('allowComments')
    expect(payload).toHaveProperty('displayStats')
    expect(payload).toHaveProperty('enableDownloads')
    expect(payload).toHaveProperty('enableContentId')
    expect(payload).toHaveProperty('includeInRss')
    expect(payload).toHaveProperty('copyrightConfirmed')
    expect(payload).toHaveProperty('excerptStart')
    expect(payload).toHaveProperty('excerptEnd')
  })
})
