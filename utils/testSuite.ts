import { mockDb } from '../services/mockDb';
import { UserRole, IssueCategory, IssueStatus, IssuePriority } from '../types';

/**
 * Runs a series of automated checks against the MockDB to ensure
 * business logic, authentication, and CRUD operations are functioning.
 */
export const runSystemDiagnostics = () => {
  console.group('🚀 FixMate System Diagnostics');
  let passed = 0;
  let failed = 0;

  const assert = (desc: string, condition: boolean) => {
    if (condition) {
      console.log(`%c✅ PASS: ${desc}`, 'color: green');
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  };

  try {
    // --- 1. Authentication Tests ---
    console.groupCollapsed('1. Authentication Logic');
    const testEmail = `test_${Date.now()}@example.com`;
    const testUser = mockDb.register('Test User', testEmail, 'password123', UserRole.RESIDENT);
    
    assert('User registration returns valid user object', !!testUser.id && testUser.email === testEmail);
    
    const loggedIn = mockDb.authenticate(testEmail, 'password123');
    assert('User can login with correct credentials', loggedIn?.id === testUser.id);
    
    const badLogin = mockDb.authenticate(testEmail, 'wrongpass');
    assert('User cannot login with wrong password', badLogin === undefined);
    
    try {
      mockDb.register('Dupe', testEmail, '123', UserRole.RESIDENT);
      assert('Duplicate email registration should fail', false);
    } catch (e) {
      assert('Duplicate email registration prevented', true);
    }
    console.groupEnd();

    // --- 2. Issue CRUD Tests ---
    console.groupCollapsed('2. Issue Workflow');
    const initialCount = mockDb.getIssues().length;
    
    const newIssue = mockDb.addIssue({
      residentId: testUser.id,
      residentName: testUser.name,
      category: IssueCategory.PLUMBING,
      priority: IssuePriority.HIGH,
      description: 'Diagnostic Test Issue',
      photoUrl: 'http://placeholder.com/img.jpg'
    });
    
    assert('Issue created successfully', !!newIssue.id);
    assert('Issue count incremented', mockDb.getIssues().length === initialCount + 1);
    assert('Default status is OPEN', newIssue.status === IssueStatus.OPEN);

    // Update Status
    mockDb.updateIssueStatus(newIssue.id, IssueStatus.IN_PROGRESS);
    const updatedIssue = mockDb.getIssues().find(i => i.id === newIssue.id);
    assert('Issue status updated to IN_PROGRESS', updatedIssue?.status === IssueStatus.IN_PROGRESS);

    // Assignment
    const techUser = mockDb.getUsers().find(u => u.role === UserRole.TECHNICIAN);
    if (techUser) {
        mockDb.assignIssue(newIssue.id, techUser.id);
        const assignedIssue = mockDb.getIssues().find(i => i.id === newIssue.id);
        assert('Issue assigned correctly', assignedIssue?.assignedTo === techUser.id);
        assert('Status auto-updates to ASSIGNED', assignedIssue?.status === IssueStatus.ASSIGNED);
        
        // Unassign
        mockDb.assignIssue(newIssue.id, "");
        const unassigned = mockDb.getIssues().find(i => i.id === newIssue.id);
        assert('Issue unassigned correctly', unassigned?.assignedTo === undefined);
        assert('Status reverts to OPEN on unassign', unassigned?.status === IssueStatus.OPEN);
    } else {
        console.warn('Skipping assignment tests: No technician found in DB');
    }
    console.groupEnd();

    // --- 3. Messaging Tests ---
    console.groupCollapsed('3. Messaging System');
    const msg = mockDb.sendMessage({
        senderId: testUser.id,
        senderName: testUser.name,
        senderRole: testUser.role,
        receiverId: 'admin-1',
        text: 'Test Message'
    });
    assert('Message sent successfully', !!msg.id);
    
    const conversation = mockDb.getMessages(testUser.id, testUser.role);
    assert('Message retrievable in conversation', conversation.some(m => m.id === msg.id));
    console.groupEnd();

  } catch (err) {
    console.error('CRITICAL: Test Suite Exception', err);
    failed++;
  }

  console.groupEnd();
  
  const resultString = `Diagnostics Complete: ${passed} Passed, ${failed} Failed. Check console for details.`;
  return { passed, failed, message: resultString };
};