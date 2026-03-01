'use client'

import { IWebSocketAPI } from "../types/WebSocketAPI"
import { IUser } from "../types/WebSocketUser"
import { ws } from "../websocket/websocket"
import { ReactNode, useEffect, useState, createContext, Dispatch, useContext } from "react"
import { useChats } from "../savedChatContext"
import { Message } from "@/app/generated/prisma/client"


interface IWebSocketContext {
    onlineUsers: IUser[],
    setOnlineUsers: Dispatch<((IUser)[])>
}


const WebSocketContext = createContext<IWebSocketContext | null>(null)


export function WebSocketProvider({children} : {children: ReactNode}) {
    const [onlineUsers, setOnlineUsers] = useState<IUser[]>([])
    const {updateChatLastMessage, savedChats, setSavedChats} = useChats()

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
                    console.log(message.data)
                    updated[chatIndex] = {...prev[chatIndex], messages: [(message.data.message as Message)]}
                    return [...updated]
                })
                //if (savedChats.find(chat => chat.id === message.data!.messageTarget!))
                //    updateChatLastMessage((message.data.message as unknown as Message))
                //else {
                //    setSavedChats(prev => [...prev, {id: message.data.messageTarget, messages: [], type: 'private'}])
                //}
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