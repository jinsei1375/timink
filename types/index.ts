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
