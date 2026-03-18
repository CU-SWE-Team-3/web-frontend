import {
  Play, Pause, SkipBack, SkipForward,
  Heart, Repeat, Shuffle, Volume2, VolumeX, Volume1,
  Search, Upload, Bell, User, Home, Library,
  MessageCircle, Share2, MoreHorizontal, X,
  Check, Lock, Globe, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Settings, LogOut,
  Plus, Minus, Edit, Trash2, Download, Link,
  Image, Music, List, Grid, Filter, Clock,
  TrendingUp, Radio, Mic, Headphones, Award, Ban
} from 'lucide-react'

export type IconProps = {
  size?: number
  color?: string
  fill?: string
  className?: string
}

// Player icons
export const PlayIcon = (props: IconProps) => <Play {...props} />
export const PauseIcon = (props: IconProps) => <Pause {...props} />
export const NextIcon = (props: IconProps) => <SkipForward {...props} />
export const PrevIcon = (props: IconProps) => <SkipBack {...props} />
export const RepeatIcon = (props: IconProps) => <Repeat {...props} />
export const ShuffleIcon = (props: IconProps) => <Shuffle {...props} />
export const VolumeIcon = (props: IconProps) => <Volume2 {...props} />
export const VolumeLowIcon = (props: IconProps) => <Volume1 {...props} />
export const MuteIcon = (props: IconProps) => <VolumeX {...props} />

// Engagement icons
export const LikeIcon = (props: IconProps) => <Heart {...props} />
export const RepostIcon = (props: IconProps) => <Repeat {...props} />
export const ShareIcon = (props: IconProps) => <Share2 {...props} />
export const CommentIcon = (props: IconProps) => <MessageCircle {...props} />
export const DownloadIcon = (props: IconProps) => <Download {...props} />

// Navigation icons
export const HomeIcon = (props: IconProps) => <Home {...props} />
export const SearchIcon = (props: IconProps) => <Search {...props} />
export const LibraryIcon = (props: IconProps) => <Library {...props} />
export const NotificationIcon = (props: IconProps) => <Bell {...props} />
export const MessageIcon = (props: IconProps) => <MessageCircle {...props} />
export const UploadIcon = (props: IconProps) => <Upload {...props} />
export const SettingsIcon = (props: IconProps) => <Settings {...props} />
export const LogOutIcon = (props: IconProps) => <LogOut {...props} />

// Profile icons  
export const UserIcon = (props: IconProps) => <User {...props} />
export const PublicIcon = (props: IconProps) => <Globe {...props} />
export const PrivateIcon = (props: IconProps) => <Lock {...props} />
export const EditIcon = (props: IconProps) => <Edit {...props} />

// Track icons
export const TrackIcon = (props: IconProps) => <Music {...props} />
export const PlaylistIcon = (props: IconProps) => <List {...props} />
export const AlbumIcon = (props: IconProps) => <Grid {...props} />
export const MicIcon = (props: IconProps) => <Mic {...props} />
export const HeadphonesIcon = (props: IconProps) => <Headphones {...props} />
export const RadioIcon = (props: IconProps) => <Radio {...props} />

// UI icons
export const CloseIcon = (props: IconProps) => <X {...props} />
export const CheckIcon = (props: IconProps) => <Check {...props} />
export const MoreIcon = (props: IconProps) => <MoreHorizontal {...props} />
export const AddIcon = (props: IconProps) => <Plus {...props} />
export const RemoveIcon = (props: IconProps) => <Minus {...props} />
export const DeleteIcon = (props: IconProps) => <Trash2 {...props} />
export const LinkIcon = (props: IconProps) => <Link {...props} />
export const ImageIcon = (props: IconProps) => <Image {...props} />
export const FilterIcon = (props: IconProps) => <Filter {...props} />
export const ClockIcon = (props: IconProps) => <Clock {...props} />
export const TrendingIcon = (props: IconProps) => <TrendingUp {...props} />
export const ChevronDownIcon = (props: IconProps) => <ChevronDown {...props} />
export const ChevronUpIcon = (props: IconProps) => <ChevronUp {...props} />
export const ChevronLeftIcon = (props: IconProps) => <ChevronLeft {...props} />
export const ChevronRightIcon = (props: IconProps) => <ChevronRight {...props} />
export const AwardIcon = (props: IconProps) => <Award {...props} />
export const BanIcon = (props: IconProps) => <Ban {...props} />
