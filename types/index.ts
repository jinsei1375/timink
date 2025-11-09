import { User } from '@supabase/supabase-js';

// Profile Types
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
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
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
  joined_at: string;
}

// Friendship Types
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
}

// Friend Request with Profile (リクエスト一覧表示用)
export interface FriendRequest {
  id: string;
  requester: Profile;
  status: 'pending' | 'accepted' | 'rejected';
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
  friendship_status?: 'pending' | 'accepted' | 'none';
}

// Capsule Types
export type CapsuleType = 'personal' | 'one_to_one' | 'group';
export type CapsuleStatus = 'locked' | 'unlocked' | 'deleted';
export type MemberRole = 'owner' | 'member';
export type MemberStatus = 'active' | 'left' | 'removed';
export type ContentType = 'text' | 'image' | 'video' | 'audio';

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
}

export interface CapsuleMember {
  id: string;
  capsule_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  last_viewed_at?: string;
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

// Database Schema Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      diaries: {
        Row: Diary;
        Insert: {
          id?: string;
          title: string;
          is_group?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          is_group?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      diary_entries: {
        Row: DiaryEntry;
        Insert: {
          id?: string;
          diary_id: string;
          author_id: string;
          content: string;
          image_url?: string | null;
          audio_url?: string | null;
          posted_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          diary_id?: string;
          author_id?: string;
          content?: string;
          image_url?: string | null;
          audio_url?: string | null;
          posted_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      diary_members: {
        Row: DiaryMember;
        Insert: {
          id?: string;
          diary_id: string;
          profile_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          diary_id?: string;
          profile_id?: string;
          joined_at?: string;
        };
      };
      friendships: {
        Row: Friendship;
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          status?: 'pending' | 'accepted' | 'rejected' | 'blocked';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
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
