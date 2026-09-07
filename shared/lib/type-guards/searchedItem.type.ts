import type { User } from "@/shared/types/User";
import type { Conversation } from "@/shared/types/Conversation";

export function searchedItemType(item: User | Conversation): 'user' | 'chat' {
    if ('nick' in item) return 'user'
    else return 'chat'
}