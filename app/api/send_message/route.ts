import type { IChatMessage } from "@/shared/types/IChatMessage";
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/shared/api/db";

export async function POST(request: NextRequest) {
    const {message} = await request.json() as {message: IChatMessage}
    const [newMessage] = await sql`
            WITH inserted_message AS (
                INSERT INTO "Message" ("content", "conversationId", "senderId", "isRead", "type", "createdAt")
                VALUES (${message.content}, ${message.conversationId}, ${message.senderId}, false, ${message.type}, ${message.createdAt!})
                RETURNING *
            )
            UPDATE "ConversationParticipant"
            SET 
                "lastMessageContent" = (SELECT "content" FROM inserted_message),
                "lastMessageTime" = (SELECT "createdAt" FROM inserted_message),
                "lastMessageType" = (SELECT "type" FROM inserted_message),
                "lastMessageSenderId" = (SELECT "senderId" FROM inserted_message),
                "lastMessageIsRead" = false
            WHERE "conversationId" = ${message.conversationId}
            RETURNING (SELECT id FROM inserted_message), (SELECT content FROM inserted_message), (SELECT "conversationId" FROM inserted_message), (SELECT "senderId" FROM inserted_message), (SELECT "isRead" FROM inserted_message), (SELECT type FROM inserted_message), (SELECT "createdAt" FROM inserted_message)
        `
    if (newMessage)
        return NextResponse.json({
            message: newMessage,
        }) 
    else 
        return NextResponse.json({
            message: null
        }, 
    {
        status: 501
    })
    
} 