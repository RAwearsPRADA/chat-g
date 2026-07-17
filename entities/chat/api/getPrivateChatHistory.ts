import { sql } from "@/shared/api/db";
import {Message} from '@/shared/types/Message'

export async function getPrivateChatHistory(chatId: number) {
    const history = await sql<Message[]>`
        SELECT * FROM (
        SELECT * FROM "Message"
        WHERE "conversationId" = ${chatId}
        ORDER BY "createdAt" DESC
        LIMIT 50
        ) sub
        ORDER BY "createdAt" ASC
    `
    return history
}