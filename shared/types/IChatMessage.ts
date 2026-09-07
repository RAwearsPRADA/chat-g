import type { User } from "./User"

export interface IChatMessage {
    id?: number,
    content: string,
    senderId: number ,
    senderAvatar?: string | null ,
    createdAt: number,
    receiver?: User,
    conversationId: number,
    key?: string
    isRead: boolean
    type: string
}
