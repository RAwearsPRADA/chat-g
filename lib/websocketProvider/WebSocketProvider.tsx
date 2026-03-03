'use client'

import { IWebSocketAPI } from "../types/WebSocketAPI"
import { IUser } from "../types/WebSocketUser"
import { ws } from "../websocket/websocket"
import { ReactNode, useEffect, useState, createContext, Dispatch, useContext, useRef } from "react"
import { useChats } from "../savedChatContext"
import { useChatbox } from "@/components/chatBox/chatBoxContext"


interface IWebSocketContext {
    onlineUsers: IUser[],
    setOnlineUsers: Dispatch<((IUser)[])>
}


const WebSocketContext = createContext<IWebSocketContext | null>(null)


export function WebSocketProvider({children} : {children: ReactNode}) {
    const [onlineUsers, setOnlineUsers] = useState<IUser[]>([])
    const {setSavedChats} = useChats()
    const {setChatsCache, chatsCache} = useChatbox()

    const savedChatsSetter = useRef(setSavedChats);
    const chatsCacheSetter = useRef(setChatsCache);

    useEffect(() => {
        savedChatsSetter.current = setSavedChats;
        chatsCacheSetter.current = setChatsCache;
    });

    useEffect(() => {
        ws.connect()
        ws.setMessageHandler((event: MessageEvent) => {
            const message: IWebSocketAPI = JSON.parse(event.data)
            if (message.type === 'online users' && message.data.onlineUsers) setOnlineUsers((message.data.onlineUsers as IUser[]))
            if (message.type === 'typing') {
                const typingUser = message.data!
                setOnlineUsers(prev => [...prev.filter(user => user.nick !== typingUser!.nick), (typingUser as IUser)])
            }
            if (message.type === 'new message') {
                setSavedChats(prev => {
                    const chatIndex = prev.findIndex(chat => chat.id === message.data.messageTarget)
                    const updated = [...prev]
                    updated[chatIndex] = {...prev[chatIndex], messages:[{...message.data!.message!, createdAt: new Date(message.data!.message!.createdAt)}]}
                    return [...updated]
                })
                setChatsCache(prev => {
                    if (prev.length) {
                        const index = prev.findIndex(chat => chat.chatId === message.data.message!.conversationId)
                        const updated = [...prev]
                        if (index === -1) return prev
                        if (updated[index].chatId) {
                            updated[index] = {...prev[index], chatHistory: [...prev[index].chatHistory, {...message.data!.message!, createdAt: new Date(message.data.message!.createdAt)}]}
                        }
                        return updated
                    }
                    else {
                        return prev
                    }
                })
            }
    })
        
        return () => ws.disconnect()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    ,[])
    return (
        <WebSocketContext.Provider value={{onlineUsers, setOnlineUsers}}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSockets = () => {
    const context = useContext(WebSocketContext)
    if (!context) throw new Error('must be inside provider')
    return context
}