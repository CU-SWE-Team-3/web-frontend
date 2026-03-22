# Blocked Users Feature - Test IDs Documentation

This document outlines the `data-testid` attributes implemented in the Blocked Users List feature (`/settings/blocked`). These IDs are stable and intended for use by the QA/Testing team for automated E2E and integration testing.

## Component: BlockedUsersList

| Test ID | Description | State |
|---------|-------------|-------|
| `blocked-users-list` | The main container for the list of blocked users. | Success State |
| `blocked-empty-state` | The container displaying the "You haven't blocked anyone" message. | Empty State |
| `blocked-loading` | The container holding the skeleton loading placeholder rows. | Loading State |

## Component: BlockedUserRow

| Test ID | Description |
|---------|-------------|
| `blocked-user-row` | The container for a single blocked user row in the list. |
| `blocked-user-avatar`| The avatar component displaying the user's image or fallback initials. |
| `blocked-user-username`| The container holding the user's `@username` and display name. |
| `unblock-button` | The clickable button to unblock the user. |

---

### Example Usage (Cypress)
```javascript
// Check if the list renders
cy.get('[data-testid="blocked-users-list"]').should('exist')

// Check the empty state
cy.get('[data-testid="blocked-empty-state"]').should('contain.text', "You haven't blocked anyone")

// Click the first unblock button
cy.get('[data-testid="unblock-button"]').first().click()
```

### Example Usage (React Testing Library)
```javascript
// Wait for loading to finish
await waitForElementToBeRemoved(() => screen.queryByTestId('blocked-loading'))

// Verify specific user row
const firstRow = screen.getAllByTestId('blocked-user-row')[0]
expect(within(firstRow).getByTestId('blocked-user-username')).toHaveTextContent('user_alias')
```

---

## Module 4: Tracks & Audio Upload

### Component: UploadDropzone
| Test ID | Description |
|---------|-------------|
| `upload-dropzone` | The main container for the drag-and-drop zone. |
| `upload-dropzone-area` | The visual drop area reacting to drag events. |
| `upload-dropzone-input` | The hidden native file input. |
| `upload-dropzone-remove` | Button to remove the selected file before upload. |
| `upload-dropzone-error` | Container for displaying file validation errors. |

### Component: TrackForm
| Test ID | Description |
|---------|-------------|
| `track-form` | The main `<form>` element. |
| `track-form-file-preview` | The container showing the selected audio file before metadata entry. |
| `track-form-title-input` | Input for the track title. |
| `track-form-genre-select` | Select dropdown for the track genre. |
| `track-form-date-input` | Date input for release date. |
| `track-form-tags-input` | Text input for comma-separated tags. |
| `track-form-description-input` | Textarea for the track description. |
| `track-form-visibility-public` | Button to set track as Public. |
| `track-form-visibility-private` | Button to set track as Private. |
| `track-form-status-processing` | Button to set track as Processing (Mock UI only). |
| `track-form-status-finished` | Button to set track as Finished (Mock UI only). |
| `track-form-submit-button` | The final submit button to upload or save metadata. |

### Component: WaveformPlayer
| Test ID | Description |
|---------|-------------|
| `waveform-player` | The main container for the audio player. |
| `waveform-play-button` | The toggle button for Play/Pause. |
| `waveform-current-time` | Element displaying the current playback time. |
| `waveform-duration` | Element displaying the total track duration. |

### Component: TrackCard
| Test ID | Description |
|---------|-------------|
| `track-card-{trackId}` | The root article element for a track. The ID contains the track's unique ID. |
| `track-card-title-link` | The hyperlink on the track title. |
| `track-card-status` | The badge displaying the processing status. |
| `track-card-visibility` | The badge displaying public/private visibility. |
| `track-card-copy-link-btn` | Button to copy the secret link (Private tracks only). |
| `track-card-edit-btn` | Button to open the track in edit mode. |
| `track-card-delete-btn` | Button to delete the track. |

### Component: ImageCropper
| Test ID | Description |
|---------|-------------|
| `image-cropper-modal` | The root modal overlay for the image cropper. |
| `image-cropper-close` | The "X" icon to close the modal. |
| `image-cropper-cancel` | The "Cancel" button to close the modal without saving. |
| `image-cropper-apply` | The "Crop & Apply" button to save the cropped image. |

