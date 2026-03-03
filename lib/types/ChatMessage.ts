import type { User } from "@/app/generated/prisma/client";

export interface IChatMessage {
    id?: number,
    content: string,
    senderId: number ,
    senderAvatar?: string | null ,
    createdAt?: Date,
    receiver?: User,
    conversationId: number,
    key?: string
    isRead: boolean
}
