import type { User } from "@/app/generated/prisma/client";

export interface IChatMessage {
    id?: number,
    content: string,
    sender: User ,
    senderAvatar?: string | null ,
    createdAt?: string,
    receiver: User,
    conversationId: number,
    key?: string
}
