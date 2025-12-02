import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { db } from '../services/db';
import { Send, User as UserIcon } from 'lucide-react';

interface ChatWidgetProps {
  currentUser: User;
  targetUser?: User; // For Admin to select who they are talking to
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser, targetUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For Admin chat, if no target is selected, effectivePartnerId is undefined.
  // For Resident/Tech, partner is always 'admin-1' (or whatever UUID the admin has in the real DB).
  // Note: In a real system, we'd need to find the Admin's UUID. 
  // For simplicity here, we assume there is a user with ID 'admin-1' or we rely on the backend finding Admins.
  // Actually, let's fix this: Resident talks to *any* Admin? Or a specific one?
  // The 'messages' table has 'receiver_id'. 
  // Let's assume Residents send to a placeholder 'ADMIN' or we broadcast to all admins.
  // Current implementation: mockDb used 'admin-1'. 
  // With Supabase, we should probably just query messages where (sender=me AND receiver_role='ADMIN')?
  // To keep it simple for this migration: We will rely on the `db.getMessages` to filter correctly.
  
  const effectivePartnerId = currentUser.role === UserRole.ADMIN 
    ? targetUser?.id 
    : 'admin-1'; // TODO: In production, fetch the actual Admin UUID

  const loadMessages = async () => {
    const allMsgs = await db.getMessages(currentUser.id, currentUser.role);
    
    // Filter for the specific conversation
    // If I am resident, I see all my messages (db.getMessages handles this)
    // If I am Admin, I only want messages with targetUser
    
    let conversation = allMsgs;
    if (currentUser.role === UserRole.ADMIN && targetUser) {
        conversation = allMsgs.filter(m => 
            m.senderId === targetUser.id || m.receiverId === targetUser.id
        );
    }
    
    setMessages(conversation);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id, effectivePartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, effectivePartnerId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Use placeholder 'admin-1' if resident sending to admin
    const receiver = currentUser.role === UserRole.ADMIN ? targetUser?.id : 'admin-1';
    
    if (!receiver) return;

    await db.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: receiver,
      text: inputText.trim()
    });

    setInputText('');
    loadMessages();
  };

  if (currentUser.role === UserRole.ADMIN && !targetUser) {
    return (
      <div className="h-[500px] flex items-center justify-center text-gray-400 border rounded-lg bg-white">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          Chat with {currentUser.role === UserRole.ADMIN ? targetUser?.name : 'Admin'}
        </h3>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-white">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                  isMe ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[10px] block mt-1 ${isMe ? 'text-teal-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t bg-gray-50 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-md transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};