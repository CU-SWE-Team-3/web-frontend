# Upload Module — Component ID Reference

> **For the QA / Testing Team**
> Every interactive element in the Upload module has a unique `data-testid` attribute.
> Use these IDs in your Cypress, Playwright, or Testing Library selectors.

---

## Upload Page (`/upload`)

| `data-testid` | Element | Location |
|---|---|---|
| `upload-page` | Main page wrapper | Top-level `<main>` |
| `upload-dropzone` | Drag-and-drop area | Dropzone stage |
| `upload-dropzone-input` | Hidden file `<input>` | Inside dropzone |
| `upload-record-button` | Microphone record button | Recording accordion |
| `upload-record-timer` | Recording timer display | Recording accordion (visible while recording) |
| `metadata-form` | Metadata form wrapper | Form stage |
| `metadata-title-input` | Track title input | Form stage |
| `metadata-link-input` | Track link (permalink) input | Form stage |
| `metadata-genre-button` | Genre dropdown trigger | Form stage |
| `metadata-genre-search` | Genre search input | Genre dropdown (when open) |
| `metadata-genre-option-*` | Individual genre option | Genre dropdown |
| `metadata-tags-input` | Tags input | Form stage |
| `metadata-description-input` | Description textarea | Form stage |
| `metadata-privacy-toggle-public` | Public privacy radio | Form stage |
| `metadata-privacy-toggle-private` | Private privacy radio | Form stage |
| `metadata-privacy-toggle-schedule` | Schedule privacy radio | Form stage |
| `metadata-save-button` | Upload / Save button | Fixed bottom bar |

---

## Upload Options Panel (`UploadOptionsPanel`)

### Tab Bar

| `data-testid` | Element | Description |
|---|---|---|
| `upload-options-panel` | Panel wrapper | Container for all tabs |
| `options-tab-metadata` | Metadata tab button | Switches to Metadata view |
| `options-tab-permissions` | Permissions tab button | Switches to Permissions view |
| `options-tab-advanced` | Advanced tab button | Switches to Advanced view |

### Metadata Tab

| `data-testid` | Element | Type | Default |
|---|---|---|---|
| `options-metadata-tab` | Tab content wrapper | `<div>` | — |
| `options-contains-music` | Contains music | `<select>` | `"Yes"` |
| `options-artist` | Artist name | `<input text>` | from `artistName` prop |
| `options-publisher` | Publisher | `<input text>` | `""` |
| `options-isrc` | ISRC code | `<input text>` | `""` |
| `options-composer` | Composer | `<input text>` | `""` |
| `options-release-title` | Release title | `<input text>` | `""` |
| `options-buy-link-radio-buy` | Buy-link radio | `<input radio>` | **checked** |
| `options-buy-link-radio-storefront` | Storefront radio | `<input radio>` | unchecked |
| `options-buy-link` | Buy-link URL | `<input url>` | `""` |
| `options-album-title` | Album title | `<input text>` | `""` |
| `options-record-label` | Record label | `<input text>` | `""` |
| `options-release-date` | Release date | `<input date>` | `""` |
| `options-barcode` | Barcode | `<input text>` | `""` |
| `options-iswc` | ISWC code | `<input text>` | `""` |
| `options-p-line` | P line | `<input text>` | `""` |
| `options-explicit-content` | Explicit content | `<select>` | `"No"` |
| `options-license-all-rights` | All Rights Reserved radio | `<input radio>` | **checked** |
| `options-license-cc` | Creative Commons radio | `<input radio>` | unchecked |

### Permissions Tab

| `data-testid` | Element | Type | Default |
|---|---|---|---|
| `options-permissions-tab` | Tab content wrapper | `<div>` | — |
| `options-toggle-comments` | Allow comments toggle | `<button role="switch">` | **ON** |
| `options-toggle-stats` | Display stats toggle | `<button role="switch">` | **ON** |
| `options-toggle-downloads` | Enable downloads toggle | `<button role="switch">` | OFF |
| `options-toggle-content-id` | Content ID toggle | `<button role="switch">` | OFF |
| `options-toggle-rss` | Include in RSS toggle | `<button role="switch">` | **ON** |
| `options-copyright-checkbox` | Copyright confirmation | `<input checkbox>` | unchecked |

### Advanced Tab

| `data-testid` | Element | Type | Description |
|---|---|---|---|
| `options-advanced-tab` | Tab content wrapper | `<div>` | — |
| `excerpt-waveform` | Waveform region selector | `<div>` | Wavesurfer.js + RegionsPlugin container. Drag the orange region to select a 20-second preview clip. |

---

## Upload Success Modal (`UploadSuccessModal`)

| `data-testid` | Element | Description |
|---|---|---|
| `upload-success-modal` | Modal overlay | Full-screen dark overlay |
| `upload-success-close-button` | Close (✕) button | Top-right corner |
| `upload-success-view-track-button` | "View track" button | Navigates to `/profile/{username}` |

---

## Tips for Selectors

```javascript
// Playwright
await page.getByTestId('metadata-save-button').click();

// Cypress
cy.get('[data-testid="options-tab-permissions"]').click();

// Testing Library
screen.getByTestId('options-toggle-downloads');
```
