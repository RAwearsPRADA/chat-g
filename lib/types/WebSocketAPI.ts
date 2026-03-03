import type { ObjectValue, SetObject } from "./ObjectsArray.types"
import type { IUser } from "./WebSocketUser"




export interface IWebSocketAPI {
    type: 'online users' | 'typing' | 'offline user' | "new message" | 'auth' | 'disconnect',
    data:
    {
        nick?: string,
        onlineUsers?: Record<keyof IUser, ObjectValue>[] | SetObject[]
        isTyping?: boolean,
        messageTarget?: number
        message?: {
            content: string,
            conversationId: number,
            createdAt: string,
            isRead: boolean,
            senderId: number
        }
    }
}