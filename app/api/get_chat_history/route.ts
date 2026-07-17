import type { chatType } from "@/shared/types/chatType";
import { NextRequest, NextResponse } from "next/server";
import { findPrivateChat } from "@/entities/chat/api/getChatHistory";
import { getPrivateChatHistory } from "@/entities/chat/api/getPrivateChatHistory";

export async function POST(request: NextRequest) {
    const {chatId}: {chatId: number} = await request.json()
    const chatHistory = await findPrivateChat(chatId)
    return NextResponse.json({
        chatHistory: chatHistory.reverse()
    })
}

export interface IGeneralChat {
    chatId: number | null,
    chatHistory?: Awaited<ReturnType<typeof getPrivateChatHistory>>,
    type: chatType
}