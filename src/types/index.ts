export interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  college: string | null;
  interests: string[] | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  members?: Profile[];
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: Profile;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Vibe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  mood: string | null;
  song_title: string | null;
  artist_name: string | null;
  cover_url: string | null;
  external_url: string | null;
  created_at: string;
  user?: Profile;
}

export interface VoiceRoom {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  status: 'active' | 'ended';
  created_at: string;
  ended_at: string | null;
  host?: Profile;
  membersCount?: number;
}

export interface VoiceRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  left_at: string | null;
  user?: Profile;
}
