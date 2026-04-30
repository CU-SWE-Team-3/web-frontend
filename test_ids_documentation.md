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
| **PlaylistGridCard** | `playlist-grid-card` | Library/profile playlist card root |
| | `playlist-grid-card-{id}` | Playlist artwork link for a specific playlist |
| | `playlist-grid-card-artwork` | Playlist cover image |
| | `playlist-grid-card-artwork-placeholder` | Empty cover fallback |
| | `playlist-grid-card-play-button` | Hover play button |
| | `playlist-grid-card-track-count` | Displayed track count |
| | `playlist-grid-card-title` | Playlist title text |
| | `playlist-grid-card-creator` | Playlist creator display name |
| **PlaylistDetailHeader** | `playlist-detail-header` | Playlist page header root |
| | `playlist-title` | Playlist title text |
| | `playlist-header-play-btn` | Header play button |
| | `playlist-header-creator-name` | Creator name next to playlist title |
| | `playlist-header-track-count` | Large track count in header stats |
| | `playlist-header-creator-avatar` | Creator avatar image in details sidebar |
| | `playlist-header-creator-avatar-placeholder` | Creator avatar fallback |
| | `playlist-header-sidebar-creator-name` | Creator name under sidebar avatar |
| | `playlist-artwork` | Playlist cover artwork region |
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

### Social Graph Components
| Component | Test ID | Description |
|-----------|---------|-------------|
| **Followers/Following** | `followers-page` | Followers page root wrapper |
| | `followers-empty` | Empty state text on Followers page |
| | `following-page` | Following page root wrapper |
| | `following-empty` | Empty state text on Following page |
| **FollowListGrid** | `follow-list-grid` | Main user list grid wrapper |
| | `follow-list-empty` | Grid empty placeholder |
| | `follow-skeleton` | Loading skeleton item |
| **FollowUserCard** | `follow-card-{id}` | Individual root user card |
| | `follow-card-avatar` | User Avatar inside card |
| | `follow-card-name` | User displayName text |
| | `follow-card-followers-count` | Follower stat text |
| | `follow-card-btn` | Hover toggle follow button |

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

#### Auth Action Pages (Verify, Reset, Update)
- `verify-email-page`, `confirm-email-page`, `reset-password-page`: Root wrappers
- `verify-email-loading`, `confirm-email-loading`: API loading states
- `verify-email-success`, `confirm-email-success`, `reset-password-success`: Success states
- `verify-email-error`, `confirm-email-error`, `reset-password-error`: API or token errors
- `verify-email-signin-btn`, `confirm-email-signin-btn`, `reset-password-signin-btn`: Login redirect buttons
- `reset-password-form`: Reset form wrapper
- `reset-password-new-input`, `reset-password-confirm-input`: Password inputs
- `reset-password-submit-btn`: Reset submission button


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

### User Profile & Miscellaneous Modals
| Component | Test ID | Description |
|-----------|---------|-------------|
| **ProfileFeature** | `profile-feature` | Root feature container |
| **LikedTracksList** | `liked-tracks-skeleton` | Loading placeholder |
| | `liked-tracks-empty` | Empty state text |
| | `liked-tracks-list` | Container for populated liked tracks |
| **AvatarUpload** | `avatar-upload` | Avatar image upload area |
| **CoverUpload** | `cover-upload` | Cover image upload area |
| **EditProfileForm** | `edit-profile-form` | Form element for profile edits |
| **GenreTagInput** | `genre-tag-input` | Tag builder for genres |
| **RoleSelector** | `role-selector` | Listener/Artist toggle |
| **SocialLinks** | `social-links` | Root wrapper for links |
| **FollowersDialog** | `followers-dialog-content`| Inner content wrapper |
| **FollowingDialog** | `following-dialog-content`| Inner content wrapper |
| **SocialPageLayout** | `social-page-layout` | Entire layout background wrapper |
| **AudioUploader** | `audio-uploader` | Audio file input wrapper |
| **EditTrackModal** | `edit-track-modal` | Background dialog overlay |
| | `edit-track-modal-panel` | Interactive track modal panel |
| **ArtistSuggestionCard** | `artist-suggestion-card`| Root user suggestion card |
| **AuthModal** | `auth-modal` | Root modal overlay |
| **EmailForm** | `auth-email-form` | Email `<form>` container |
| **SocialLogins** | `social-logins` | Third-party oAuth icons container |

---

## Module 7-12 Feature Test IDs

### Module 7: Sets & Playlists
| Feature / Component | Test ID | Description |
|-----------|---------|-------------|
| **Playlist Page** | `playlist-error-state` | Playlist detail error state |
| **Playlist CRUD** | `create-playlist-title` | Playlist title input in create flows |
| | `create-playlist-save` | Create playlist submit button |
| | `edit-playlist-title` | Playlist title input in edit modal |
| | `edit-playlist-save` | Save playlist changes button |
| | `edit-modal-delete-btn` | Delete playlist button inside edit modal |
| | `delete-playlist-cancel` | Cancel delete confirmation |
| | `delete-playlist-confirm` | Confirm playlist deletion |
| **Add To Playlist** | `add-to-playlist-tab-add` | Existing playlist tab |
| | `add-to-playlist-tab-create` | Create playlist tab |
| | `add-to-playlist-filter` | Playlist filter input |
| | `add-to-playlist-row-{playlistId}` | Selectable playlist row |
| | `add-to-playlist-confirm` | Add selected track to playlist button |
| **Track Picker** | `track-picker-search` | Track search input |
| | `track-picker-option-{trackId}` | Selectable track option |
| | `track-picker-cancel` | Cancel track picker |
| | `track-picker-add` | Add selected tracks button |
| **Track Sequencing** | `playlist-track-list` | Ordered playlist track list |
| | `playlist-track-{trackId}` | Playlist track row |
| | `playlist-track-drag-{trackId}` | Drag handle for reordering |
| | `playlist-track-remove-{trackId}` | Remove track from playlist button |
| | `playlist-tracks-empty` | Empty playlist track state |
| | `playlist-add-first-track` | Empty-state add first track button |
| | `playlist-add-tracks` | Add tracks button in populated list |
| | `edit-track-remove-{trackId}` | Remove track from edit playlist modal |
| **Playlist Detail Header** | `playlist-detail-header` | Playlist header root |
| | `playlist-title` | Playlist title |
| | `playlist-header-play-btn` | Playlist play button |
| | `playlist-header-creator-name` | Creator name in header |
| | `playlist-header-track-count` | Header track count |
| | `playlist-artwork` | Playlist cover artwork |
| | `playlist-like-btn` | Playlist like button |
| | `playlist-add-to-next-btn` | Add playlist to queue button |
| | `playlist-share-btn` | Open playlist share modal |
| | `playlist-edit-btn` | Open edit playlist modal |
| | `playlist-delete-btn` | Open delete playlist dialog |
| | `playlist-header-creator-avatar` | Creator avatar image |
| | `playlist-header-creator-avatar-placeholder` | Creator avatar fallback |
| | `playlist-header-sidebar-creator-name` | Creator name in sidebar |
| **Playlist Grid Card** | `playlist-grid-card` | Playlist card root |
| | `playlist-grid-card-{playlistId}` | Playlist artwork/detail link |
| | `playlist-grid-card-artwork` | Playlist cover image |
| | `playlist-grid-card-artwork-placeholder` | Empty cover fallback |
| | `playlist-grid-card-play-button` | Card play button |
| | `playlist-grid-card-track-count` | Track count label |
| | `playlist-grid-card-title` | Playlist title |
| | `playlist-grid-card-creator` | Playlist creator |
| **Playlist Stream Card** | `playlist-stream-{playlistId}` | Stream playlist card root |
| | `stream-play-btn` | Stream card play button |
| | `playlist-stream-view-more` | Expand collapsed stream tracks |
| **Playlist Share / Embed** | `share-tab-link` | Share link tab |
| | `share-tab-embed` | Embed tab |
| | `playlist-share-facebook-button` | Facebook playlist share button |
| | `share-link-input` | Share URL input |
| | `share-copy-link` | Copy playlist URL button |
| | `share-embed-textarea` | Embed iframe text area |
| | `share-copy-embed` | Copy embed code button |
| **Playlist Privacy** | No dedicated `data-testid` | Privacy radios are present in `EditPlaylistModal`, but they currently do not expose specific test IDs. |

### Module 8: Feed, Search & Discover
| Feature / Component | Test ID | Description |
|-----------|---------|-------------|
| **Stream / Activity Feed** | `feed-page` | Feed page root |
| | `feed-skeleton` | Feed loading skeleton |
| | `feed-track-list` | Chronological track list |
| | `feed-track-item` | Individual feed track wrapper |
| | `feed-suggested-artist-card` | Suggested artist card |
| | `feed-artist-follow-button` | Suggested artist follow button |
| | `suggested-artists-section` | Suggested artists section |
| | `feed-sidebar-likes` | Sidebar likes module |
| | `track-card-like-button` | Feed track like button |
| **Feed Track Card** | `track-card` | Feed track card root |
| | `track-card-artwork` | Track artwork |
| | `track-card-title` | Track title link |
| | `track-card-waveform` | Track waveform container |
| | `track-card-plays` | Track play count |
| | `track-card-comments` | Track comment count |
| **Comments / Engagement** | `comment-list` | Comment list root |
| | `comment-item-{commentId}` | Individual comment row |
| | `comment-input` | Comment input root |
| | `comment-text-input` | Comment text field |
| | `comment-timestamp-badge` | Timestamp marker badge |
| | `comment-submit-button` | Submit comment button |
| | `engagement-list-modal` | Likes/reposts modal root |
| | `engagement-list-content` | Modal content wrapper |
| | `engagement-list-loading` | Engagement list loading state |
| | `engagement-list-empty` | Empty engagement list |
| | `engagement-list-items` | Populated engagement list |
| | `engagement-item-{userId}` | User item in engagement list |
| | `engagement-user-{userId}` | Engagement user row |
| **Resource Resolver** | No dedicated `data-testid` | `src/lib/resolvePermalink.ts` is non-UI logic and is covered through unit tests rather than DOM IDs. |
| **Global Search Bar** | `navbar-search-bar` | Search bar wrapper |
| | `navbar-search-submit-button` | Search submit button |
| | `navbar-search-input` | Search text input |
| | `navbar-search-clear-button` | Clear search button |
| **Search Page** | `search-page` | Search page root |
| | `search-sidebar` | Search filter sidebar |
| | `search-tab-{tabId}` | Search category tab |
| | `search-results-list` | Search results container |
| **Discover / Trending** | `discover-page` | Discover page root |
| | `trending-by-genre` | Trending by genre section |

### Module 9: Messaging & Track Sharing
| Feature / Component | Test ID | Description |
|-----------|---------|-------------|
| **Messages Page** | `messages-page` | Messages layout root |
| | `messages-sidebar` | Conversation sidebar |
| | `new-message-button` | New conversation button |
| | `messages-chat-empty` | Empty chat panel |
| **Conversation List** | `conversation-list` | Conversation list root |
| | `conversation-item-{conversationId}` | Conversation row |
| | `unread-dot-{conversationId}` | Conversation unread indicator |
| **Conversation View** | `conversation-view` | Open conversation panel |
| | `first-message-banner` | First-message safety banner |
| | `chat-action-bar` | Conversation action toolbar |
| | `block-button` | Block user button |
| | `report-button` | Report user button |
| | `mark-unread-button` | Mark conversation unread button |
| | `delete-conversation-button` | Open delete/archive popover |
| | `blocked-banner` | Blocked conversation banner |
| | `message-thread` | Message thread container |
| | `typing-indicator` | Typing indicator |
| | `report-spam-toast` | Report spam confirmation toast |
| **Message Composer** | `message-composer` | Composer root |
| | `message-textarea` | Message text input |
| | `message-send-button` | Send message button |
| **Message Bubble** | `message-{messageId}` | Message bubble root |
| | `message-avatar-{messageId}` | Sender avatar |
| | `message-sender-{messageId}` | Sender name |
| | `message-time-{messageId}` | Message timestamp |
| | `message-content-{messageId}` | Message body |
| | `message-edited-{messageId}` | Edited marker |
| | `message-status-{messageId}` | Status row |
| | `message-status-sent` | Sent status icon |
| | `message-status-delivered` | Delivered status icon |
| | `message-status-read` | Read status icon |
| **Message Dropdown** | `navbar-messages-button` | Navbar messages button |
| | `unread-badge` | Navbar unread count |
| | `message-dropdown` | Message dropdown panel |
| | `msg-dropdown-item-{conversationId}` | Dropdown conversation item |
| | `dropdown-unread-dot-{conversationId}` | Dropdown unread marker |
| | `view-all-messages` | Link to messages page |
| **New Conversation** | `new-conversation-modal` | New conversation modal |
| | `recipient-search-input` | Recipient search field |
| | `search-result-{userId}` | Recipient search result |
| | `new-conv-message-input` | Initial message input |
| | `new-conv-send-button` | Start conversation button |
| **Attachments / Previews** | `add-attachment-modal` | Track/playlist attachment modal |
| | `attachment-track-{trackId}` | Track attachment option |
| | `attachment-playlist-{playlistId}` | Playlist attachment option |
| | `track-preview-{trackId}` | Embedded track preview card |
| | `track-preview-play-btn` | Track preview play button |
| | `track-preview-share-btn` | Track preview share button |
| | `track-preview-like-btn` | Track preview like button |
| | `playlist-preview-{playlistId}` | Embedded playlist preview card |
| | `playlist-preview-play-btn` | Playlist preview play button |
| | `playlist-preview-like-btn` | Playlist preview like button |
| **Blocking / Reporting** | `block-user-modal` | Block user modal |
| | `block-modal-close` | Close block modal |
| | `remove-content-checkbox` | Remove old messages checkbox |
| | `report-spam-checkbox` | Report spam checkbox |
| | `block-modal-cancel` | Cancel block action |
| | `block-modal-confirm` | Confirm block action |
| | `delete-conversation-popover` | Delete/archive popover |
| | `archive-report-spam-checkbox` | Report archived conversation as spam |
| | `archive-cancel` | Cancel archive/delete action |
| | `archive-confirm` | Confirm archive/delete action |
| | `report-user-modal` | Report user modal |
| | `report-modal-close` | Close report modal |
| | `report-reason-{reason-slug}` | Report reason link |
| | `report-spam-cancel` | Cancel spam report |
| | `report-spam-confirm` | Confirm spam report |
| **Track / Profile Sharing** | `track-share-modal` | Track share modal root |
| | `share-modal` | Profile share modal root |
| | `share-modal-twitter-button` | Twitter/X profile share button |
| | `share-modal-facebook-button` | Facebook profile share button |
| | `share-modal-url-input` | Profile share URL input |
| | `share-modal-copy-button` | Copy profile share URL button |
| | `share-modal-shorten-checkbox` | Shorten profile URL checkbox |

### Module 10: Real-Time Notifications
| Feature / Component | Test ID | Description |
|-----------|---------|-------------|
| **Activity Triggers / Navbar** | `navbar-notifications-button` | Navbar notifications button |
| | `notification-unread-dot` | Navbar unread indicator |
| **Notification Dropdown** | `notification-dropdown` | Dropdown root |
| | `notification-dropdown-header` | Dropdown header |
| | `notification-mark-all-read` | Mark all read button |
| | `notification-dropdown-settings-link` | Notification settings link |
| | `notification-dropdown-list` | Notification dropdown list |
| | `notification-dropdown-empty` | Empty dropdown state |
| | `notification-dropdown-view-all` | View all notifications link |
| **Notification Item** | `notification-item-{notificationId}` | Notification row |
| | `notification-item-avatar-{notificationId}` | Notification actor avatar |
| | `notification-item-text-{notificationId}` | Notification text |
| | `notification-follow-btn-{userId}` | Follow button inside notification item |
| **Notifications Page** | `notifications-page` | Notifications page root |
| | `notif-banner-close` | Close notification banner |
| | `notifications-page-title` | Page title |
| | `notifications-filter-button` | Filter dropdown trigger |
| | `notifications-filter-dropdown` | Filter dropdown panel |
| | `notifications-filter-{filterKey}` | Individual filter option |
| | `notifications-list` | Notification list |
| | `notifications-empty` | Empty page state |
| | `notif-page-item-{notificationId}` | Page notification row |
| | `notif-page-avatar-{notificationId}` | Page notification avatar |
| | `notif-page-actor-link-{notificationId}` | Actor profile link |
| | `notif-page-artwork-{notificationId}` | Related track/playlist artwork |
| | `notif-page-more-{notificationId}` | More actions button |
| | `notif-page-delete-{notificationId}` | Delete notification action |
| | `notif-page-follow-btn-{userId}` | Follow button on notification page |
| **Notification Settings** | `notification-settings-tab` | Settings tab root |
| | `notification-settings-activities` | Activity notification preferences |
| | `notification-activities-email-header` | Activity email column header |
| | `notification-activities-devices-header` | Activity devices column header |
| | `notification-settings-updates` | Update notification preferences |
| | `notification-updates-email-header` | Updates email column header |
| | `notification-updates-devices-header` | Updates devices column header |
| | `notification-pref-{preferenceKey}-email` | Email preference checkbox |
| | `notification-pref-{preferenceKey}-devices` | Device/push preference checkbox |
| | `notification-settings-cancel-btn` | Cancel settings changes |
| | `notification-settings-save-btn` | Save settings changes |

### Module 11: Moderation & Admin Dashboard
| Feature / Component | Test ID | Description |
|-----------|---------|-------------|
| **User Report System** | `report-user-modal` | User-facing report modal |
| | `report-modal-close` | Close report modal |
| | `report-reason-{reason-slug}` | Report reason link, such as spam or abuse |
| | `report-spam-cancel` | Cancel spam report |
| | `report-spam-confirm` | Confirm spam report |
| **Blocking / Spam Moderation** | `block-user-modal` | Block user modal |
| | `remove-content-checkbox` | Remove old conversation content checkbox |
| | `report-spam-checkbox` | Also report as spam checkbox |
| | `block-modal-cancel` | Cancel block action |
| | `block-modal-confirm` | Confirm block action |
| | `settings-blocked-users-list` | Blocked users settings section |
| | `blocked-users-list` | Blocked users list |
| | `settings-blocked-user-item` | Blocked user row |
| | `blocked-user-username` | Blocked user's display name |
| | `settings-unblock-button` | Unblock user button |
| | `blocked-loading` | Blocked users loading state |
| | `blocked-empty-state` | Empty blocked users state |
| **Admin Panel** | No dedicated `data-testid` | `src/features/admin/**` currently has no `data-testid` attributes; admin panels use component structure and some DOM `id` attributes instead. |
| **Platform Health** | No dedicated `data-testid` | Health dashboard UI currently has no `data-testid` attributes. |

### Module 12: Premium Subscription (Pro/Go+)
| Feature / Component | Test ID | Description |
|-----------|---------|-------------|
| **Subscription Page** | `subscription-page` | Subscription page root |
| | `subscription-banner` | Top subscription banner |
| | `subscription-banner-link` | Banner CTA link |
| | `subscription-banner-close` | Close banner button |
| | `subscription-title` | Page title |
| | `subscription-current-plans-title` | Current plan section title |
| | `subscription-error` | Subscription error message |
| | `subscription-cancel-success` | Cancel success message |
| | `subscription-cancel-confirm` | Cancel confirmation card |
| | `subscription-cancel-confirm-yes` | Confirm cancellation |
| | `subscription-cancel-confirm-no` | Keep subscription button |
| | `subscription-plan-card` | Current plan card |
| | `subscription-plan-name` | Current plan name |
| | `subscription-active-badge` | Active subscription badge |
| | `subscription-plan-description` | Plan description |
| | `subscription-plan-active-desc` | Active plan description |
| | `subscription-billing-info` | Billing details |
| | `subscription-expiry-note` | Subscription expiry note |
| | `subscription-try-pro-btn` | Try Pro button |
| | `subscription-cancel-btn` | Cancel subscription button |
| | `subscription-offline-card` | Offline listening card |
| | `subscription-student-banner` | Student plan banner |
| | `subscription-student-link` | Student plan CTA |
| | `subscription-history-title` | Billing history title |
| | `subscription-history-empty` | Empty billing history |
| | `subscription-sidebar` | Help/sidebar root |
| | `subscription-sidebar-troubleshoot` | Troubleshooting link |
| | `subscription-sidebar-billing-help` | Billing help link |
| | `subscription-sidebar-tax` | Tax information link |
| | `subscription-lang-select` | Language selector |
| **Offline Perks** | `offline-download-{trackId}` | Offline download button for a track |
| | `offline-library-empty` | Empty offline library |
| | `offline-library` | Offline library root |
| | `offline-clear-all` | Clear offline library button |
| | `offline-track-{trackId}` | Offline track card |
| | `offline-remove-{trackId}` | Remove offline track button |
| **Premium Ads** | `premium-ad-banner` | Premium upsell banner |
| | `premium-ad-dismiss` | Dismiss premium ad |
| | `premium-ad-subscribe-link` | Premium subscribe link |
| **Artist Pro Page** | `artist-pro-page` | Artist Pro page root |
| | `artist-pro-navbar` | Artist Pro navbar |
| | `artist-pro-logo` | Artist Pro logo link |
| | `artist-pro-user-info` | Signed-in user info |
| | `artist-pro-profile-btn` | Profile dropdown button |
| | `artist-pro-profile-dropdown` | Profile dropdown menu |
| | `artist-pro-signout-btn` | Sign out button |
| | `artist-pro-hero` | Hero section |
| | `artist-pro-title` | Hero title |
| | `artist-pro-get-btn` | Primary get Pro CTA |
| | `artist-pro-all-plans-btn` | All plans CTA |
| | `artist-pro-features` | Feature list |
| | `artist-pro-feature-item` | Feature item |
| | `artist-pro-plans` | Plans section |
| | `artist-pro-plans-title` | Plans section title |
| | `plan-card-artist` | Free Artist plan card |
| | `plan-card-artist-cta` | Artist plan CTA |
| | `plan-card-artist-pro` | Artist Pro plan card |
| | `plan-card-pro-cta` | Artist Pro CTA |
| | `artist-pro-compare` | Plan comparison section |
| | `artist-pro-compare-title` | Comparison section title |
| | `compare-artist-cta` | Artist comparison CTA |
| | `compare-pro-cta` | Pro comparison CTA |
| | `compare-section-{section-slug}` | Comparison section |
| | `compare-row` | Comparison row |
| | `artist-pro-footer` | Footer |
| | `artist-pro-footer-signout` | Footer sign out link |

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
