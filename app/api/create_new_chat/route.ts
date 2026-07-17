import type { chatType } from "@/shared/types/chatType";
import { NextResponse, NextRequest } from "next/server";
import { createChat } from "@/entities/chat/api/createNewGeneralChat";
import { redis } from "@/shared/api/redis";

const WS_PROPAGATION_DELAY = 50

export async function POST(request: NextRequest) {
    const {firstUserId, secondUserId, type}: {firstUserId: number, secondUserId: number, type: chatType} = await (request.json())
    if (!firstUserId || !secondUserId ) 
        return NextResponse.json({
        error: 'Chat has contain one user at least'
        }, {status: 400})

    const [firstUserNick, secondUserNick] = await Promise.all([
        redis.hget(`user:${firstUserId}`, 'nick'),
        redis.hget(`user:${secondUserId}`, 'nick')
    ])
    const pipeline = redis.pipeline()
    const chat = await createChat({
        participantsIds: [firstUserId, secondUserId],
        type
    })
    if (chat) {
        for (const pId of [firstUserId, secondUserId]) {
            if (pId)
                pipeline.sadd(`user:${pId}:chats`, chat.id)
        }
        if (firstUserNick && secondUserNick)
            pipeline.sadd(`chat:${chat.id}:members`, firstUserNick, secondUserNick)

        await pipeline.exec()
        new Promise(resolve => setTimeout(resolve, WS_PROPAGATION_DELAY))
        return NextResponse.json({chat})
    }
    return NextResponse.json({error: "Something went wrong"}, {status: 500})
    
}