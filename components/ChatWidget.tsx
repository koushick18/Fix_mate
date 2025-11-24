import React, { useState, useEffect, useRef } from 'react';
import { User, Message, UserRole } from '../types';
import { mockDb } from '../services/mockDb';
import { Send, User as UserIcon } from 'lucide-react';

interface ChatWidgetProps {
  currentUser: User;
  targetUser?: User; // For Admin to select who they are talking to
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser, targetUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine the effective chat partner ID
  // If Resident/Tech, partner is always 'admin-1'
  // If Admin, partner is the selected targetUser
  const effectivePartnerId = currentUser.role === UserRole.ADMIN 
    ? targetUser?.id 
    : 'admin-1';

  const loadMessages = () => {
    const allMsgs = mockDb.getMessages(currentUser.id, currentUser.role);
    
    // Filter for the specific conversation
    const conversation = allMsgs.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === effectivePartnerId) ||
      (m.receiverId === currentUser.id && m.senderId === effectivePartnerId)
    );
    
    // We sort here to ensure order
    setMessages(conversation.sort((a, b) => a.timestamp - b.timestamp));
  };

  useEffect(() => {
    loadMessages();
    // Simple polling for demo purposes
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id, effectivePartnerId]);

  // FIX: Only scroll when the number of messages changes or the chat partner changes.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, effectivePartnerId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !effectivePartnerId) return;

    mockDb.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: effectivePartnerId,
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