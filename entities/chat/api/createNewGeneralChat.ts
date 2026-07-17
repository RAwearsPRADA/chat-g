import { sql } from "@/shared/api/db"
import { redis } from "@/shared/api/redis"

export interface IChatCreate {
    participantsIds: number[],
    title?: string,
    type: 'PRIVATE' | 'GROUP' | 'CHANNEL' | 'SAVED'  // don't forget
}


export async function createChat({
    participantsIds,
    type,
    title
}: IChatCreate) {
    if (participantsIds.length < 1) 
        throw new Error()
    const sortedIds = [...participantsIds].sort((a, b) => a - b)
    
    if (type === 'SAVED' && (participantsIds[0] === participantsIds[1])) {
        const [existingChat] = await sql`
            SELECT * FROM "ConversationParticipant" cp
            WHERE cp."userId" = ${participantsIds[0]}
            AND cp."conversationType" = 'SAVED'
        `
        if (existingChat)
            return {id: existingChat.conversationId, type: 'SAVED'}

        const newChat = await sql.begin(async sql => {
            const [chat] = await sql<{id: number, type: string}[]>`
                INSERT INTO "Conversation" ("type", "updatedAt")
                VALUES ('SAVED', ${Date.now()})
                RETURNING "id", "type"
            `
            await sql`
                INSERT INTO "ConversationParticipant" 
                ("userId", "conversationId", "conversationType")
                VALUES (${participantsIds[0]}, ${chat.id}, 'SAVED')
            `
            return chat
        })
        return newChat
    }
    if (type === 'PRIVATE' && participantsIds.length === 2) {
        const [existingChat] = await sql`
            SELECT "conversationId" as "id"
            FROM "ConversationParticipant"
            WHERE "userId" = ANY(${sortedIds})
            GROUP BY "conversationId"
            HAVING COUNT(DISTINCT "userId") = 2
                AND COUNT("userId") = 2
            LIMIT 1
        `
        if (existingChat)
            return {id: existingChat.id, type: 'PRIVATE'}

        const newChat = await sql.begin(async sql => {
            const [chat] = await sql`
                INSERT INTO "Conversation" ("type", "updatedAt")
                VALUES ('PRIVATE', ${Date.now()})
                RETURNING "id", "type"
            `
            const participants = participantsIds.map(userId => ({
                conversationId: chat.id,
                userId,
                conversationType: 'PRIVATE'
            }))

            await sql`
                INSERT INTO "ConversationParticipant" ${sql(participants, 'conversationId', 'userId', 'conversationType')}
            `
            return chat
        })
        await redis.publish('chat:created', JSON.stringify({
            chatId: newChat.id,
            participantsIds
        }))
        return newChat
    }
}