import type { User, Conversation } from "@/app/generated/prisma/client";

export function searchedItemType(item: User | Conversation): 'user' | 'chat' {
    if ('nick' in item) return 'user'
    else return 'chat'
}