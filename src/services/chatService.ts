import { supabase } from '@/lib/supabase';
import { Conversation, Message, Profile } from '@/types';

export const chatService = {
  // Fetch conversations involving the current user
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      // Step 1: Get all conversation IDs the user belongs to
      const { data: memberRecords, error: memberError } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', userId);

      if (memberError) throw memberError;
      if (!memberRecords || memberRecords.length === 0) return [];

      const conversationIds = memberRecords.map((m) => m.conversation_id);

      // Step 2: Fetch details of these conversations, including other members and messages
      const { data: convos, error: convoError } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          conversation_members (
            user_id,
            profiles (
              id,
              display_name,
              username,
              avatar_url,
              bio,
              profile_completed
            )
          )
        `)
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convoError) throw convoError;

      // Step 3: Map data and fetch the last message for each conversation
      const result: Conversation[] = [];
      for (const raw of convos) {
        // Extract members profiles
        const membersList: Profile[] = (raw.conversation_members || [])
          .map((m: any) => m.profiles)
          .filter((p: any) => p !== null);

        // Fetch last message
        const { data: msgData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', raw.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (msgError) {
          console.error('Error fetching last message:', msgError);
        }

        result.push({
          id: raw.id,
          created_at: raw.created_at,
          updated_at: raw.updated_at,
          members: membersList,
          lastMessage: msgData || undefined,
        });
      }

      // Sort conversations by last message timestamp or updated_at
      return result.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : new Date(a.updated_at).getTime();
        const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : new Date(b.updated_at).getTime();
        return timeB - timeA;
      });
    } catch (err) {
      console.error('Error in getConversations:', err);
      return [];
    }
  },

  // Fetch messages in a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    }
  },

  // Send a message
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the conversation's updated_at timestamp to bubble it to top of list
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      return null;
    }
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  },

  // Get or create a 1-to-1 conversation between current user and target user
  async getOrCreateDirectChat(currentUserId: string, targetUserId: string): Promise<string | null> {
    try {
      // Find all conversations current user is in
      const { data: myConvos } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      if (myConvos && myConvos.length > 0) {
        const myConvoIds = myConvos.map((c) => c.conversation_id);

        // Find if target user is in any of these conversations
        const { data: commonConvos } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .in('conversation_id', myConvoIds)
          .eq('user_id', targetUserId);

        // Filter and verify it's a 1-to-1 conversation (has exactly 2 members)
        if (commonConvos && commonConvos.length > 0) {
          for (const item of commonConvos) {
            const { count } = await supabase
              .from('conversation_members')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', item.conversation_id);

            if (count === 2) {
              // Found the existing 1-to-1 chat!
              return item.conversation_id;
            }
          }
        }
      }

      // If no 1-to-1 conversation exists, create a new one
      const { data: newConvo, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (createError) throw createError;

      // Add both members
      const { error: addMembersError } = await supabase
        .from('conversation_members')
        .insert([
          { conversation_id: newConvo.id, user_id: currentUserId },
          { conversation_id: newConvo.id, user_id: targetUserId },
        ]);

      if (addMembersError) throw addMembersError;

      return newConvo.id;
    } catch (err) {
      console.error('Error in getOrCreateDirectChat:', err);
      return null;
    }
  },

  // Subscribe to realtime messages in a conversation
  subscribeToMessages(conversationId: string, onNewMessage: (message: Message) => void) {
    return supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender profile details to match message struct
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single();

          const messageWithSender: Message = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            read_at: payload.new.read_at,
            sender: senderProfile || undefined,
          };

          onNewMessage(messageWithSender);
        }
      )
      .subscribe();
  },
};
