import type { chatType } from "./chatType"
import type { IUserSession } from "./IUserSession"
import type { User } from "./User"
import type { Message } from "./Message"

export interface IData {
    type: 'online users' | 'typing' | 'offline user' | "new message" | "auth" | "disconnect" ,
    data:
    {
        id?: number,
        user?: User,
        nick?: string,
        onlineUsers?: Map<string, IUserSession> | [string, IUserSession][],
        isTyping?: boolean,
        messageTarget?: number,
        message?: Omit<Message, 'id'>
        chatType?: chatType
    }
}


interface IAuth { 
    type: 'auth'
    data: {
        nick: string
    }
}

interface ITyping {
    type: 'typing',
    data: {
        id: number,
        nick: string,
        messageTarget: number,
        isTyping: boolean
    }
}

interface INewMessage {
    type: 'new message'
    data: {
        id: number,
        user: User,
        nick: string,
        messageTarget: number,
        isTyping: boolean,
        message: Message,
        isFirstMessageInChat: boolean
    }
}

