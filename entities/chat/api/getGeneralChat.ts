import { sql } from "@/shared/api/db";

export async function getGeneralChat(firstUserId: number, secondUserId: number) {
    console.log(firstUserId, secondUserId)
    const participantIds = [firstUserId, secondUserId]
    const chat = await sql`
        SELECT * FROM "ConversationParticipant" cp
        WHERE cp."userId" = ANY(${participantIds})
    `
    return chat
}