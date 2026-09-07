import type { Message } from "@/shared/types/Message";
import { sql } from "@/shared/api/db";

export async function findPrivateChat(chatId: number){
    const chat = await sql<Message[]>`
        SELECT * FROM "Message"
        WHERE "conversationId" = ${Number(chatId)}
        ORDER BY "createdAt" DESC
        LIMIT 20
    `
    return chat
}