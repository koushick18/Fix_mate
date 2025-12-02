import { supabase } from './supabaseClient';
import { Issue, IssueStatus, Message, User, UserRole } from '../types';

// Map Supabase 'profiles' to App 'User'
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role as UserRole,
  avatar: profile.avatar
});

export const db = {
  // --- AUTH ---
  getCurrentSession: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      // Fetch profile details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      
      if (profile) return mapProfileToUser(profile);
    }
    return null;
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;
      return mapProfileToUser(profile);
    }
    throw new Error("Login failed");
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    // 1. Sign up in Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Registration failed");

    // 2. Create Profile
    const newUser: User = {
      id: data.user.id,
      name,
      email,
      role,
      avatar: `https://picsum.photos/seed/${data.user.id}/200`
    };

    const { error: dbError } = await supabase.from('profiles').insert({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar
    });

    if (dbError) throw dbError;
    return newUser;
  },

  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map(mapProfileToUser);
  },

  // --- ISSUES ---
  getIssues: async (): Promise<Issue[]> => {
    const { data, error } = await supabase.from('issues').select('*');
    if (error) {
      console.error("Error fetching issues", error);
      return [];
    }
    // Map snake_case to camelCase
    return data.map((i: any) => ({
      ...i,
      residentId: i.resident_id,
      residentName: i.resident_name,
      photoUrl: i.photo_url,
      assignedTo: i.assigned_to,
      assignedToName: i.assigned_to_name,
      resolutionNotes: i.resolution_notes,
      createdAt: new Date(i.created_at).getTime(),
      updatedAt: new Date(i.updated_at).getTime()
    }));
  },

  addIssue: async (issue: Partial<Issue>) => {
    const dbIssue = {
      resident_id: issue.residentId,
      resident_name: issue.residentName,
      category: issue.category,
      description: issue.description,
      photo_url: issue.photoUrl,
      status: IssueStatus.OPEN,
      priority: issue.priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase.from('issues').insert(dbIssue).select().single();
    if (error) console.error(error);
    return data;
  },

  updateIssueStatus: async (id: string, status: IssueStatus, notes?: string) => {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    if (notes) updateData.resolution_notes = notes;

    await supabase.from('issues').update(updateData).eq('id', id);
  },

  assignIssue: async (issueId: string, technicianId: string, technicianName?: string) => {
    if (!technicianId) {
      // Unassign
      await supabase.from('issues').update({
        assigned_to: null,
        assigned_to_name: null,
        status: IssueStatus.OPEN,
        updated_at: new Date().toISOString()
      }).eq('id', issueId);
    } else {
      // Assign
      await supabase.from('issues').update({
        assigned_to: technicianId,
        assigned_to_name: technicianName,
        status: IssueStatus.ASSIGNED,
        updated_at: new Date().toISOString()
      }).eq('id', issueId);
    }
  },

  // --- MESSAGES ---
  getMessages: async (userId: string, role: UserRole): Promise<Message[]> => {
    let query = supabase.from('messages').select('*');
    
    // If not admin, only show own messages
    if (role !== UserRole.ADMIN) {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }
    
    const { data } = await query.order('created_at', { ascending: true });
    
    return (data || []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      senderRole: m.sender_role,
      receiverId: m.receiver_id,
      text: m.text,
      timestamp: m.timestamp || new Date(m.created_at).getTime()
    }));
  },

  sendMessage: async (msg: Partial<Message>) => {
    const dbMsg = {
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      receiver_id: msg.receiverId,
      text: msg.text,
      timestamp: Date.now(),
      created_at: new Date().toISOString()
    };
    
    await supabase.from('messages').insert(dbMsg);
  }
};