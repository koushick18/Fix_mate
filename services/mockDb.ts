import { Issue, IssueCategory, IssueStatus, IssuePriority, Message, User, UserRole } from '../types';

const STORAGE_KEY = 'fixmate_db_v1';
const SESSION_KEY = 'fixmate_session_v1';

// Initial Seed Data
const SEED_USERS: User[] = [
  { 
    id: 'res-1', 
    name: 'Alice Resident', 
    email: 'alice@res.com', 
    password: 'password', 
    role: UserRole.RESIDENT, 
    avatar: 'https://picsum.photos/seed/alice/200' 
  },
  { 
    id: 'res-2', 
    name: 'Bob Resident', 
    email: 'bob@res.com', 
    password: 'password', 
    role: UserRole.RESIDENT, 
    avatar: 'https://picsum.photos/seed/bob/200' 
  },
  { 
    id: 'tech-1', 
    name: 'Tom Tech', 
    email: 'tom@tech.com', 
    password: 'password', 
    role: UserRole.TECHNICIAN, 
    avatar: 'https://picsum.photos/seed/tom/200' 
  },
  { 
    id: 'tech-2', 
    name: 'Sarah Tech', 
    email: 'sarah@tech.com', 
    password: 'password', 
    role: UserRole.TECHNICIAN, 
    avatar: 'https://picsum.photos/seed/sarah/200' 
  },
  { 
    id: 'admin-1', 
    name: 'Admin User', 
    email: 'admin@fixmate.com', 
    password: 'admin', 
    role: UserRole.ADMIN, 
    avatar: 'https://picsum.photos/seed/admin/200' 
  },
];

const SEED_ISSUES: Issue[] = [
  {
    id: '1',
    residentId: 'res-1',
    residentName: 'Alice Resident',
    category: IssueCategory.PLUMBING,
    description: 'Leaky faucet in the kitchen.',
    photoUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600&h=400&auto=format&fit=crop',
    status: IssueStatus.OPEN,
    priority: IssuePriority.MEDIUM,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: '2',
    residentId: 'res-2',
    residentName: 'Bob Resident',
    category: IssueCategory.ELECTRICAL,
    description: 'Light flickering in the hallway.',
    photoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&h=400&auto=format&fit=crop',
    status: IssueStatus.ASSIGNED,
    priority: IssuePriority.HIGH,
    assignedTo: 'tech-1',
    assignedToName: 'Tom Tech',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    id: '3',
    residentId: 'res-1',
    residentName: 'Alice Resident',
    category: IssueCategory.CARPENTRY,
    description: 'Cabinet door hinge is broken.',
    photoUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&h=400&auto=format&fit=crop',
    status: IssueStatus.RESOLVED,
    priority: IssuePriority.LOW,
    assignedTo: 'tech-2',
    assignedToName: 'Sarah Tech',
    resolutionNotes: 'Replaced the hinge with a new soft-close model.',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: '4',
    residentId: 'res-2',
    residentName: 'Bob Resident',
    category: IssueCategory.CLEANING,
    description: 'Common area carpet stain removal.',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&h=400&auto=format&fit=crop',
    status: IssueStatus.IN_PROGRESS,
    priority: IssuePriority.MEDIUM,
    assignedTo: 'tech-1',
    assignedToName: 'Tom Tech',
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 3600000,
  },
  // Stress Test Item
  {
    id: '5',
    residentId: 'res-1',
    residentName: 'Alice Resident',
    category: IssueCategory.OTHER,
    description: 'The main entrance gate is making a very loud screeching noise whenever it opens or closes. This has been happening for about a week now and it is extremely disturbing especially late at night. I suspect the motor might be failing or the tracks need serious lubrication. Please check ASAP as neighbors are complaining.',
    photoUrl: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=600&h=400&auto=format&fit=crop',
    status: IssueStatus.OPEN,
    priority: IssuePriority.HIGH,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  }
];

// State Containers
let users: User[] = [...SEED_USERS];
let issues: Issue[] = [...SEED_ISSUES];
let messages: Message[] = [];

// --- Persistence Helpers ---

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      users = data.users || [...SEED_USERS];
      issues = data.issues || [...SEED_ISSUES];
      messages = data.messages || [];
    }
  } catch (e) {
    console.error("Failed to load from local storage", e);
  }
};

const saveToStorage = () => {
  try {
    const data = { users, issues, messages };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
};

// Initialize on load
loadFromStorage();

export const mockDb = {
  getUsers: async () => [...users],
  
  getIssues: async () => [...issues],

  addIssue: async (issue: Omit<Issue, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newIssue: Issue = {
      ...issue,
      id: Math.random().toString(36).substr(2, 9),
      status: IssueStatus.OPEN,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    issues.push(newIssue);
    saveToStorage();
    return newIssue;
  },

  updateIssueStatus: async (id: string, status: IssueStatus, notes?: string) => {
    const issue = issues.find(i => i.id === id);
    if (issue) {
      issue.status = status;
      issue.updatedAt = Date.now();
      if (notes) issue.resolutionNotes = notes;
      saveToStorage();
    }
  },

  assignIssue: async (issueId: string, technicianId: string, technicianName?: string) => {
    const issue = issues.find(i => i.id === issueId);
    
    // In mock mode, we find the tech by ID to confirm existence
    const tech = users.find(u => u.id === technicianId);
    
    if (issue) {
      if (!technicianId) {
        // Handle Unassignment
        issue.assignedTo = undefined;
        issue.assignedToName = undefined;
        issue.status = IssueStatus.OPEN;
      } else if (tech && tech.role === UserRole.TECHNICIAN) {
        // Handle Assignment
        issue.assignedTo = tech.id;
        issue.assignedToName = tech.name;
        issue.status = IssueStatus.ASSIGNED;
      }
      issue.updatedAt = Date.now();
      saveToStorage();
    }
  },

  getMessages: async (userId: string, role: UserRole) => {
    if (role === UserRole.ADMIN) return messages;
    return messages.filter(m => m.senderId === userId || m.receiverId === userId);
  },

  sendMessage: async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    messages.push(newMessage);
    saveToStorage();
    return newMessage;
  },

  // --- AUTHENTICATION METHODS ---
  getCurrentSession: async (): Promise<User | null> => {
     try {
       const session = localStorage.getItem(SESSION_KEY);
       if(session) {
         return JSON.parse(session);
       }
     } catch(e) {}
     return null;
  },

  login: async (email: string, pass: string): Promise<User> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (!user) throw new Error("Invalid credentials (Mock DB)");
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  logout: async () => {
    localStorage.removeItem(SESSION_KEY);
  },

  register: async (name: string, email: string, pass: string, role: UserRole): Promise<User> => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("User with this email already exists.");
    }
    if (role === UserRole.ADMIN) {
       throw new Error("Cannot register as Admin in demo.");
    }

    const newUser: User = {
      id: `${role.toLowerCase().substr(0,3)}-${Math.random().toString(36).substr(2,5)}`,
      name,
      email,
      password: pass,
      role,
      avatar: `https://picsum.photos/seed/${Math.random()}/200`
    };
    
    users.push(newUser);
    saveToStorage();
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  seedSampleData: async () => {
     // In Mock DB, resetting data essentially re-seeds it
     localStorage.removeItem(STORAGE_KEY);
     users = [...SEED_USERS];
     issues = [...SEED_ISSUES];
     messages = [];
     loadFromStorage();
  }
};