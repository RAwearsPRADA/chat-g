import type { User } from "@/app/generated/prisma/client";

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
