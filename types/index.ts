import { User } from '@supabase/supabase-js';

// Types
export enum CapsuleType {
  Personal = 'personal',
  WithFriends = 'with_friends',
}

export enum DiaryType {
  Personal = 'personal',
  WithFriends = 'with_friends',
}

export enum CapsuleStatus {
  Locked = 'locked',
  Unlocked = 'unlocked',
  Deleted = 'deleted',
}

export enum MemberRole {
  Owner = 'owner',
  Member = 'member',
}

export enum MemberStatus {
  Active = 'active',
  Left = 'left',
  Removed = 'removed',
}

export enum ContentType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
}

export enum FriendshipStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected',
  Blocked = 'blocked',
  None = 'none',
}

export enum ActivityType {
  CapsuleUnlockable = 'capsule_unlockable', // 開封可能
  CapsulePending = 'capsule_pending', // まだ投稿していない
  DiaryAvailable = 'diary_available', // 今日投稿可能
  DiaryMemory = 'diary_memory', // 過去の振り返り
  FriendRequest = 'friend_request', // 友達申請
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

// Diary Types
export interface Diary {
  id: string;
  title: string;
  diary_type: DiaryType;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

// 交換日記と最新エントリー、メンバー情報を含む型
export interface DiaryWithDetails {
  id: string;
  title: string;
  diary_type: DiaryType;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: Profile[];
  latest_entry?: DiaryEntry & { author: Profile };
  unread_count: number;
  is_pinned: boolean;
}

// Diary Entry Types
export interface DiaryEntry {
  id: string;
  diary_id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  audio_url: string | null;
  posted_date: string;
  created_at: string;
  updated_at: string;
}

// Diary Member Types
export interface DiaryMember {
  id: string;
  diary_id: string;
  profile_id: string;
  is_pinned: boolean;
  joined_at: string;
}

// Friendship Types
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

// Friend Request with Profile (リクエスト一覧表示用)
export interface FriendRequest {
  id: string;
  requester: Profile;
  status: FriendshipStatus;
  created_at: string;
}

// Friend with Profile (友達一覧表示用)
export interface Friend {
  id: string;
  profile: Profile;
  friendship_id: string;
  since: string;
}

// ユーザー検索結果用
export interface UserSearchResult {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_friend: boolean;
  friendship_status?: FriendshipStatus;
}

export interface Capsule {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  unlock_at: string;
  capsule_type: CapsuleType;
  status: CapsuleStatus;
  unlocked_at?: string;
  updated_at: string;
  is_pinned: boolean;
}

export interface CapsuleMember {
  id: string;
  capsule_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  last_viewed_at?: string;
  profile?: Profile;
}

export interface CapsuleContent {
  id: string;
  capsule_id: string;
  created_by: string;
  content_type: ContentType;
  text_content?: string;
  media_url?: string;
  media_thumbnail_url?: string;
  file_size?: number;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface CapsuleWithMembers extends Capsule {
  members: CapsuleMember[];
  contents_count?: number;
  creator?: Profile;
}

export interface CreateCapsuleData {
  title: string;
  description?: string;
  unlock_at: string;
  capsule_type: CapsuleType;
  member_ids?: string[];
}

export interface UpdateCapsuleContentData {
  text_content?: string;
  media_url?: string;
  media_thumbnail_url?: string;
}

export interface CapsuleContentWithAuthor extends CapsuleContent {
  author?: Profile;
}

// Auth Types
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Activity Types (Home Feed)
export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  badgeColor?: string;
  icon: string;
  actionable: boolean;
  data: {
    diaryId?: string;
    capsuleId?: string;
    friendRequestId?: string;
  };
}

export interface ActivitySection {
  title: string;
  activities: Activity[];
}

// UI Component Types
export type TypeOption<T> = {
  value: T;
  icon: any; // Ionicons.glyphMap key
  title: string;
  description: string;
};

// Refresh Events
export enum RefreshEvent {
  CAPSULE_CREATED = 'capsule:created',
  CAPSULE_UPDATED = 'capsule:updated',
  CAPSULE_UNLOCKED = 'capsule:unlocked',
  DIARY_CREATED = 'diary:created',
  DIARY_UPDATED = 'diary:updated',
  FRIEND_ADDED = 'friend:added',
  FRIEND_ACCEPTED = 'friend:accepted',
}
