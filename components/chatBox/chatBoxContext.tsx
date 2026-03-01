'use client'
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from "react";
import type { Conversation, Message, User } from "@/app/generated/prisma/client";

interface IChatboxState {
    chatboxState: User | Conversation,
    chatHistory: Message[],
    setChatHistory: Dispatch<SetStateAction<Message[]>>,
    switchChatboxState: (item: User | Conversation) => void,
    chatId: number
}

const getPrivateChatHistory = async (item: User | Conversation): Promise<{generalChat: {messages: Message[]}, chatId: number}> =>
{
    const data = await fetch('/api/get_chat', {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            item,
        })
    })
    const response = await data.json()
    return response
}

const ChatboxContext = createContext<IChatboxState | null>(null)

export function ChatboxProvider({children}: {children: ReactNode}) {
    const [chatboxState, setChatboxState] = useState<User | Conversation>()
    const [chatId, setChatId] = useState<number>(0)
    const [chatHistory, setChatHistory] = useState<Message[]>([])
    const [chatsCache, setChatsCache] = useState<{chatId: number, chatHistory: Message[]}[]>([])
    const switchChatboxState = (item: User | Conversation): void => {
        if ('nick' in item) {
            setChatboxState(item)
            getPrivateChatHistory(item).then(data => {
                setChatId(data.chatId)
                setChatsCache(prev => [...prev, {chatId: data.chatId, chatHistory: data.generalChat.messages}])
                setChatHistory(data.generalChat.messages.reverse())
            })
        }
        else {
            console.log('Доработать баля') //finish it
        }
    }    
        return (<>
            <ChatboxContext.Provider value={{chatboxState: chatboxState!, switchChatboxState, chatHistory, setChatHistory, chatId, }}>
                {children}
            </ChatboxContext.Provider>
        </>)
}

export const useChatbox = () => {
    const context = useContext(ChatboxContext)
    if (!context) throw new Error('must be in provider')
    return context
}