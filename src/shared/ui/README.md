# Shared UI Component Library

> **Owner:** Basel (Frontend Sub-Leader)  
> **Rule:** Never build your own UI elements. Always import from here.

---

## What is this folder?

This is the **shared UI component library** for the SoundCloud clone frontend.  
Every button, input, card, modal, icon, and layout component lives here.  
All 6 frontend teammates import from this single source of truth.

---

## How to import components

```tsx
import { AppButton, AppInput, UserAvatar, TrackCard } from '@/shared/ui'
```

Every component is exported from `@/shared/ui` (the barrel file `index.ts`).  
You never need to import from a subfolder directly.

### Available components

| Category | Components |
|---|---|
| **Core** | `AppButton`, `AppInput`, `AppModal`, `AppToast`, `SkeletonLoader` |
| **User** | `UserAvatar`, `FollowButton`, `VerifiedBadge` |
| **Track** | `TrackCard`, `TrackCardSkeleton`, `FeedTrackCard`, `PlaylistCard`, `SidebarTrackItem` |
| **Track Metadata** | `LikeButton`, `PlayCount`, `TrackDuration`, `GenreTag`, `ActionBar`, `StatCounter` |
| **Layout** | `NavBar`, `SidebarNav`, `PlayerBar`, `TabBar`, `SearchBar`, `AnnouncementBanner` |
| **Content** | `ArtistSuggestionCard`, `EmptyState`, `DropZone`, `SocialButton` |
| **Brand** | `SoundCloudLogo` |

---

## How to import icons

```tsx
import { PlayIcon, LikeIcon, SearchIcon, HomeIcon } from '@/shared/ui'
```

Icons are re-exported from `lucide-react` with SoundCloud-specific names.  
**Never import from `lucide-react` directly.** Always use the aliases from here.

### Available icons

| Category | Icons |
|---|---|
| **Player** | `PlayIcon`, `PauseIcon`, `NextIcon`, `PrevIcon`, `RepeatIcon`, `ShuffleIcon`, `VolumeIcon`, `VolumeLowIcon`, `MuteIcon` |
| **Engagement** | `LikeIcon`, `RepostIcon`, `ShareIcon`, `CommentIcon`, `DownloadIcon` |
| **Navigation** | `HomeIcon`, `SearchIcon`, `LibraryIcon`, `NotificationIcon`, `MessageIcon`, `UploadIcon`, `SettingsIcon`, `LogOutIcon` |
| **Profile** | `UserIcon`, `PublicIcon`, `PrivateIcon`, `EditIcon` |
| **Track** | `TrackIcon`, `PlaylistIcon`, `AlbumIcon`, `MicIcon`, `HeadphonesIcon`, `RadioIcon` |
| **UI** | `CloseIcon`, `CheckIcon`, `MoreIcon`, `AddIcon`, `RemoveIcon`, `DeleteIcon`, `LinkIcon`, `ImageIcon`, `FilterIcon`, `ClockIcon`, `TrendingIcon`, `ChevronDownIcon`, `ChevronUpIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `AwardIcon` |

### Icon props

```tsx
type IconProps = {
  size?: number    // default: 24
  color?: string   // default: currentColor
  className?: string
}
```

---

## The one rule

> **Never build your own UI elements.**  
> If a component you need doesn't exist here, ask Basel to add it.  
> Do not create buttons, inputs, cards, modals, or icons in your feature folders.  
> Always import from `@/shared/ui`.

---

## CSS variables

All components use design tokens defined in `tokens/globals.scss`.  
Import it once in your app's global stylesheet:

```scss
@use '@/shared/ui/tokens/globals.scss';
```

Key variables: `--sc-primary` (#ff5500), `--sc-bg-dark` (#111), `--sc-white`, `--sc-gray-*`, etc.
