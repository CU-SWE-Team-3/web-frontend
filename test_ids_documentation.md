# BioBeats Test IDs Documentation

This document outlines all the `data-testid` attributes implemented in the BioBeats application. These IDs are designed for automated unit and integration testing following the `component-element-modifier` naming convention.

## Shared UI Components

### Core Elements
| Component | Test ID | Description |
|-----------|---------|-------------|
| **NavBar** | `navbar` | Main navigation container |
| | `navbar-logo` | Brand logo in navbar |
| | `navbar-search-input` | Global search input |
| | `navbar-upload-button` | Primary upload CTA |
| | `navbar-user-avatar` | Current user's avatar |
| | `navbar-user-dropdown` | User profile menu |
| **AppButton** | `app-button` | Action button |
| | `app-button-loading` | Spinner inside button |
| **AppInput** | `app-input-container` | Input field wrapper |
| | `app-input-label` | Field label |
| | `app-input-field` | Native `<input>` |
| | `app-input-error` | Validation error message |
| **AppModal** | `app-modal-overlay` | Background overlay |
| | `app-modal-panel` | Content container |
| | `app-modal-header` | Title and description section |
| | `app-modal-close-button` | Dismiss button |
| **AppToast** | `app-toast` | Notification toast message |

### Lists and Cards
| Component | Test ID | Description |
|-----------|---------|-------------|
| **TrackCard** | `track-card` | Individual track list item |
| | `track-card-artwork` | Album art image |
| | `track-card-title` | Clickable track title |
| **FeedTrackCard** | `track-card-likes` | Like count |
| | `track-card-reposts` | Repost count |
| | `track-card-plays` | Play count |
| | `track-card-comments` | Comment count |
| **PlaylistCard** | `playlist-card` | Playlist gallery item |
| | `playlist-card-artwork` | Cover art |
| | `playlist-card-play-button` | Interactive play icon |
| **SidebarTrackItem** | `sidebar-track-item` | Small track item in sidebars |
| | `sidebar-track-artist` | Artist name |
| | `sidebar-track-plays` | Play count tooltip/label |

### Interactive Elements
| Component | Test ID | Description |
|-----------|---------|-------------|
| **FollowButton** | `follow-button` | Follow/Unfollow CTA |
| **LikeButton** | `like-button` | Heart/Favorite interactive |
| **NotificationBell**| `notification-bell` | Alerts indicator |
| **SocialButton** | `social-button-{provider}` | OAuth buttons (google, facebook, etc.) |
| **TabBar** | `tab-bar` | Tab navigation root |
| | `tab-bar-item` | Individual tab link |
| **ActionBar** | `action-bar` | Horizontal list of actions |
| | `action-bar-label` | Text label for action |

### Status and Utility
| Component | Test ID | Description |
|-----------|---------|-------------|
| **VerifiedBadge** | `verified-badge` | Blue check indicator |
| **EmptyState** | `empty-state` | Placeholder for empty lists |
| | `empty-state-title` | Main message |
| **SkeletonLoader** | `skeleton-loader` | Loading placeholder |
| **SoundCloudLogo** | `brand-logo` | Main application logo |

---

## Page-Specific Components

### Authentication
#### LoginForm
- `login-form`: Form container
- `login-email-input`: Email input
- `login-password-input`: Password input
- `login-submit-button`: Sign in button
- `login-google-btn`: Google OAuth
- `login-error`: General login error banner

#### RegisterForm
- `register-form`: Form container
- `register-displayname-input`: Display name input
- `register-email-input`: Email input
- `register-password-input`: Password input
- `register-confirm-input`: Password confirmation
- `register-submit-button`: Final signup button
- `register-success`: Post-registration success message
- `register-back-to-signin-btn`: CTA after registration

### Upload Feature
#### UploadPage
- `upload-page`: Root container
- `upload-dropzone`: Drag-and-drop area
- `upload-dropzone-input`: Hidden file input
- `upload-browse-button`: File selection CTA
- `upload-progress-bar`: Audio processing progress
- `upload-record-button`: MIC recording toggle
- `upload-record-timer`: Recording duration display

#### Metadata Form
- `metadata-form`: The complete metadata entry form
- `metadata-artwork-upload`: Artwork selection area
- `metadata-title-input`: Track title field
- `metadata-genre-input`: Searchable genre selection
- `metadata-save-button`: Final upload submission
- `metadata-privacy-toggle-{opt}`: Visibility radios (public, private)

---

## Usage Examples

### React Testing Library
```javascript
// Selecting the Nav Bar
const navbar = screen.getByTestId('navbar');

// Verifying track stats in a card
const likes = within(trackCard).getByTestId('track-card-likes');
expect(likes).toHaveTextContent('1.2K');
```

### Cypress (E2E)
```javascript
// Interact with the Login form
cy.get('[data-testid="login-email-input"]').type('test@biobeats.com');
cy.get('[data-testid="login-submit-button"]').click();
```
