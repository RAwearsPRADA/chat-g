import { IChatMessage } from "@/lib/types/ChatMessage";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const {message} = await request.json() as {message: IChatMessage}
    const newMessage = await prisma.message.create({
        data: {
            content: message.content,
            conversationId: message.conversationId,
            senderId: message.sender.id,
            isRead: false
        },

    })
    return NextResponse.json({
        message: newMessage,
        
    }) 
    
}