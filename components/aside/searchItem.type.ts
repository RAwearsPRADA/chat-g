import type { Message, Conversation } from "@/app/generated/prisma/client"

export interface User  {
    id: number;
    nick: string,
    email: string,
    name: string | null,
    messages: Message[],
    avatar: string | null,
    conversations: Conversation[]

}

