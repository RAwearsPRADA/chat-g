'use client'
import { Dispatch, SetStateAction, useEffect } from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';
import type { ISavedChat } from '@/app/api/get_saved_chats/route';
import type { Message } from '@/app/generated/prisma/client';

interface ChatContextType {
  savedChats: ISavedChat[];
  setSavedChats: Dispatch<SetStateAction<ISavedChat[]>>;
  updateChatLastMessage: (message: Message) => void;
  incrementUnread?: (chatId: string) => void;
  updateChatList: () => void;
}

const getSavedChats = async () => {
  const response = await fetch('/api/get_saved_chats')
  const data = await response.json()
  return data
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode}) {
    const [savedChats, setSavedChats] = useState<ISavedChat[]>([])
    useEffect(() => {
      getSavedChats().then((data: {savedChats: ISavedChat[], self: string}) => {
                  const savedChats = data.savedChats
                  savedChats.forEach(chat => {{
                      if (chat.type === 'private') { 
                          chat.participants = chat.participants.filter(member => member.user.nick !== data.self)
                      }}
                  })
                  setSavedChats(data.savedChats)
              })
    }, [])

    const updateChatList = () => {
      getSavedChats().then((data: {savedChats: ISavedChat[], self: string}) => {
        const savedChats = data.savedChats
        savedChats.forEach(chat => {{
          if (chat.type === 'private') { 
              chat.participants = chat.participants.filter(member => member.user.nick !== data.self)
          }}
      })
      setSavedChats(data.savedChats)
      })
    }

  const updateChatLastMessage = (message: Message) => {
    setSavedChats(prev => {
      const index = prev.findIndex(chat => chat.id === message.conversationId)
      if (index === -1) {
        updateChatList()
        return [...prev]
      }
      const updated = [...prev]
      updated[index] = {...updated[index], messages: [message]}
      return updated
    })
  }

  return (
    <ChatContext.Provider value={{ savedChats, updateChatLastMessage, setSavedChats, updateChatList }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChats() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChats must be used within ChatProvider');
  return context;
}