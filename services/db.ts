import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockDb } from './mockDb';
import { Issue, IssueStatus, IssuePriority, IssueCategory, Message, User, UserRole } from '../types';

// Map Supabase 'profiles' to App 'User'
const mapProfileToUser = (profile: any): User => ({
  id: profile.id,
  name: profile.name,
  email: profile.email,
  role: profile.role as UserRole,
  avatar: profile.avatar
});

/**
 * Hybrid Database Service
 * Automatically switches between Supabase (Live) and mockDb (Local)
 * based on environment configuration.
 */
export const db = {
  // --- AUTH ---
  getCurrentSession: async () => {
    if (!isSupabaseConfigured) return mockDb.getCurrentSession();

    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
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
    if (!isSupabaseConfigured) return mockDb.login(email, password);

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
    if (!isSupabaseConfigured) return mockDb.logout();
    await supabase.auth.signOut();
  },

  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    if (!isSupabaseConfigured) return mockDb.register(name, email, password, role);

    // 1. Sign Up in Auth
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

    if (dbError) {
      // If profile creation fails (e.g. table doesn't exist), clean up auth user if possible or throw helpful error
      console.error("Profile creation failed", dbError);
      throw new Error("Account created but profile failed. Please contact admin or check database setup.");
    }
    return newUser;
  },

  // --- USERS ---
  getUsers: async (): Promise<User[]> => {
    if (!isSupabaseConfigured) return mockDb.getUsers();
    const { data } = await supabase.from('profiles').select('*');
    return (data || []).map(mapProfileToUser);
  },

  // --- ISSUES ---
  getIssues: async (): Promise<Issue[]> => {
    if (!isSupabaseConfigured) return mockDb.getIssues();

    const { data, error } = await supabase.from('issues').select('*');
    if (error) {
      console.error("Error fetching issues", error);
      return [];
    }
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
    if (!isSupabaseConfigured) return mockDb.addIssue(issue as any);

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
    if (!isSupabaseConfigured) return mockDb.updateIssueStatus(id, status, notes);

    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    if (notes) updateData.resolution_notes = notes;

    await supabase.from('issues').update(updateData).eq('id', id);
  },

  assignIssue: async (issueId: string, technicianId: string, technicianName?: string) => {
    if (!isSupabaseConfigured) return mockDb.assignIssue(issueId, technicianId, technicianName);

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
    if (!isSupabaseConfigured) return mockDb.getMessages(userId, role);

    let query = supabase.from('messages').select('*');
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
    if (!isSupabaseConfigured) return mockDb.sendMessage(msg as any);

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
  },

  // --- SEEDING ---
  seedSampleData: async () => {
    if (!isSupabaseConfigured) return mockDb.seedSampleData();

    // 1. Create Fake Techs (Ghost Users)
    // Note: We used fixed UUIDs to ensure idempotency (running seed multiple times doesn't duplicate)
    const seedTechs = [
      { id: '11111111-1111-1111-1111-111111111111', email: 'tom@tech.com', name: 'Tom Tech', role: 'TECHNICIAN', avatar: 'https://picsum.photos/seed/tom/200' },
      { id: '22222222-2222-2222-2222-222222222222', email: 'sarah@tech.com', name: 'Sarah Tech', role: 'TECHNICIAN', avatar: 'https://picsum.photos/seed/sarah/200' }
    ];

    await supabase.from('profiles').upsert(seedTechs);

    // 2. Create Sample Issues
    const dummyResidentId = '33333333-3333-3333-3333-333333333333';
    
    const seedIssues = [
      {
        resident_id: dummyResidentId,
        resident_name: 'Alice Resident',
        category: IssueCategory.PLUMBING,
        description: 'Leaky faucet in the kitchen.',
        photo_url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600&h=400&auto=format&fit=crop',
        status: IssueStatus.OPEN,
        priority: IssuePriority.MEDIUM,
      },
      {
        resident_id: dummyResidentId,
        resident_name: 'Bob Resident',
        category: IssueCategory.ELECTRICAL,
        description: 'Light flickering in the hallway.',
        photo_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&h=400&auto=format&fit=crop',
        status: IssueStatus.ASSIGNED,
        priority: IssuePriority.HIGH,
        assigned_to: seedTechs[0].id,
        assigned_to_name: seedTechs[0].name
      },
      {
        resident_id: dummyResidentId,
        resident_name: 'Charlie Resident',
        category: IssueCategory.CARPENTRY,
        description: 'Cabinet door hinge is broken.',
        photo_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&h=400&auto=format&fit=crop',
        status: IssueStatus.RESOLVED,
        priority: IssuePriority.LOW,
        assigned_to: seedTechs[1].id,
        assigned_to_name: seedTechs[1].name,
        resolution_notes: 'Replaced the hinge with a new soft-close model.'
      }
    ];

    for (const issue of seedIssues) {
      await supabase.from('issues').insert(issue);
    }
  }
};