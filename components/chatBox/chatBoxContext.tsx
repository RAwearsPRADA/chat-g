'use client'
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useContext, useState } from "react";
import type { Conversation, Message, User } from "@/app/generated/prisma/client";

interface IChatboxState {
    chatboxState: User | Conversation | undefined,
    switchChatboxState: (item: User | Conversation) => void,
    chatId: number,
    chatsCache: IChatsCache[],
    setChatsCache: Dispatch<SetStateAction<IChatsCache[]>>
}

interface IChatsCache {
    chatId: number,
    userNick?: string,
    chatHistory: Omit<Message, 'id'>[]
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
    const [chatsCache, setChatsCache] = useState<IChatsCache[]>([])
    const switchChatboxState = (item: User | Conversation): void => {
        if ('nick' in item) {
            if (!chatboxState) setChatboxState(item)
            else {
                if ('nick' in chatboxState && chatboxState.nick !== item.nick) 
                    setChatboxState(item)
            }
            if (!chatsCache.find(chat => chat.userNick === item.nick))
            getPrivateChatHistory(item).then(data => {
                setChatId(data.chatId)
                setChatsCache(prev => [...prev, {chatId: data.chatId, userNick: item.nick, chatHistory: [...data.generalChat.messages].reverse()}])
            })
            else {
                const chat = chatsCache.find(chat => chat.userNick === item.nick)
                setChatId(chat!.chatId)
            }
        }
        else {
            console.log('Доработать баля') //finish it
        }
    }    
        return (<>
            <ChatboxContext.Provider value={{chatboxState: chatboxState, switchChatboxState, chatId, chatsCache, setChatsCache}}>
                {children}
            </ChatboxContext.Provider>
        </>)
}

export const useChatbox = () => {
    const context = useContext(ChatboxContext)
    if (!context) throw new Error('must be in provider')
    return context
}